module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "jest": false
    },
    "plugins": ["vitest"],
    "extends": ["plugin:vitest/recommended"],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "vitest/max-nested-describe": [
            "error",
            {
                "max": 3
            }
        ]
    },
    "settings" :{
        "vitest": {
            "typecheck": true,
        }
    }
}
