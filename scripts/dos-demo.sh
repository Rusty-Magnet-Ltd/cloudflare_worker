#!/usr/bin/env bash
# DoS-shield demo: runs fragile-origin and the shield under `wrangler dev`, sends each
# case with curl, and prints what actually reached the origin. Stops both on exit.
#
#   npm run demo:dos
#   SHIELD_PORT=8830 ORIGIN_PORT=8831 npm run demo:dos
set -u

SHIELD_PORT=${SHIELD_PORT:-8820}
ORIGIN_PORT=${ORIGIN_PORT:-8821}
SHIELD_INSPECTOR_PORT=${SHIELD_INSPECTOR_PORT:-8822}
ORIGIN_INSPECTOR_PORT=${ORIGIN_INSPECTOR_PORT:-8823}
LOGS=${DEMO_LOG_DIR:-.wrangler/dos-demo}
SHIELD=http://127.0.0.1:$SHIELD_PORT
ORIGIN=http://127.0.0.1:$ORIGIN_PORT
DEV=(--ip 127.0.0.1 --show-interactive-dev-session=false)

mkdir -p "$LOGS"

# Two processes: the shield's ORIGIN binding finds fragile-origin through wrangler's dev
# registry. Locally the origin also has its own port, which deployed it never has: that
# port stands in for a service an attacker can reach without going through the shield.
npx wrangler dev -c origin/wrangler.toml --port "$ORIGIN_PORT" --inspector-port "$ORIGIN_INSPECTOR_PORT" "${DEV[@]}" > "$LOGS/origin.log" 2>&1 &
ORIGIN_PID=$!
npx wrangler dev --env testing --port "$SHIELD_PORT" --inspector-port "$SHIELD_INSPECTOR_PORT" "${DEV[@]}" > "$LOGS/shield.log" 2>&1 &
SHIELD_PID=$!
stop() { kill "$SHIELD_PID" "$ORIGIN_PID" 2>/dev/null; wait "$SHIELD_PID" "$ORIGIN_PID" 2>/dev/null; }
trap stop EXIT
trap 'exit 130' INT TERM

wait_for() { curl -sS -o /dev/null --fail --retry-connrefused --retry-all-errors --retry 60 --retry-delay 1 --max-time 3 "$1" 2>/dev/null; }
wait_for "$ORIGIN/stopdos" || { echo "fragile-origin didn't start; see $LOGS/origin.log"; exit 1; }
wait_for "$SHIELD/stopdos" || { echo "the shield couldn't reach fragile-origin; see $LOGS/shield.log"; exit 1; }

payload() { head -c "$1" /dev/zero | tr '\0' a; }
MiB2=$((2 * 1024 * 1024))

# What fragile-origin logged after line $1 of its log ("nothing" if it saw nothing)
origin_saw() {
  local lines tries=0
  while :; do
    lines=$(tail -n +"$(($1 + 1))" "$LOGS/origin.log" | sed -n 's/^.*fragile-origin //p' | paste -sd ';' -)
    if [ -n "$lines" ] || [ "$tries" -ge 6 ]; then break; fi
    tries=$((tries + 1))
    sleep 0.25
  done
  echo "${lines:-nothing}"
}

row() { printf '%-44s %-11s %s\n' "$1" "$2" "$3"; }

# run_case LABEL BYTES URL curl-args...: POSTs BYTES of "a" from stdin
run_case() {
  local label=$1 bytes=$2 url=$3 mark status
  shift 3
  mark=$(wc -l < "$LOGS/origin.log")
  status=$(payload "$bytes" | curl -sS -o /dev/null -w '%{http_code}' --max-time 20 -H 'Expect:' -X POST "$url" --data-binary @- "$@" 2>/dev/null)
  if [ "$status" = 503 ]; then # wrangler dev's proxy sometimes 503s after a refused stream
    status="$(payload "$bytes" | curl -sS -o /dev/null -w '%{http_code}' --max-time 20 -H 'Expect:' -X POST "$url" --data-binary @- "$@" 2>/dev/null) (after a dev-proxy 503)"
  fi
  row "$label" "$status" "$(origin_saw "$mark")"
  curl -sS -o /dev/null --max-time 5 "$SHIELD/" 2>/dev/null # the origin never sees this; settles the dev proxy
}

echo
row "REQUEST" "STATUS" "WHAT FRAGILE-ORIGIN RECEIVED"
run_case "2 MiB straight to the origin (no shield)" "$MiB2" "$ORIGIN/stopdos"
run_case "2 MiB via the shield, Content-Length" "$MiB2" "$SHIELD/stopdos"
run_case "26 bytes sent, Content-Length: 10" 26 "$SHIELD/stopdos" -H 'Content-Length: 10'
run_case "10 bytes sent, Content-Length: 100" 10 "$SHIELD/stopdos" -H 'Content-Length: 100'

mark=$(wc -l < "$LOGS/origin.log")
status=$(curl -sS -o /dev/null -L -w '%{http_code}' --max-time 20 -H 'Expect:' -H 'Accept: text/html' --data-urlencode 'message=hello' "$SHIELD/stopdos" 2>/dev/null)
row "small form via the shield, following 303" "303 -> $status" "$(origin_saw "$mark")"

# Last on purpose: when the shield cancels an upload that is still streaming in, wrangler
# dev 4.64's local proxy logs "Network connection lost" and can 503 the next request or
# exit. That proxy only exists in local dev.
run_case "2 MiB via the shield, chunked (no length)" "$MiB2" "$SHIELD/stopdos" -H 'Transfer-Encoding: chunked'

cat <<EOF

The first row is what an attacker gets if fragile-origin can be reached without the shield.
Content-Length: 10 with 26 bytes: the connection only carries the declared 10 bytes,
so the origin gets exactly those, with a correct Content-Length. Content-Length: 100 with
10 bytes: the rest never arrives, and the shield gives up after BODY_DEADLINE_MS (408).
Logs: $LOGS
EOF
