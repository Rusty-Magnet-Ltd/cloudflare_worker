import { Hono } from "hono";
import { serve, WorkflowBindings } from "@upstash/workflow/hono";

const workflow = new Hono<{ Bindings: WorkflowBindings }>();

const someWork = (input: string) => {
  return `processed '${JSON.stringify(input)}'`;
};

workflow.post(
  "/workflow",
  serve<{ text: string }>(
    async (context) => {
      const input = context.requestPayload.text;
      const result1 = await context.run("step1", async () => {
        const output = someWork(input);
        console.log("step 1 input", input, "output", output);
        return output;
      });

      await context.run("step2", async () => {
        const output = someWork(result1);
        console.log("step 2 input", result1, "output", output);
      });
    },
    {
      receiver: undefined
    }
  )
);

export default workflow;
