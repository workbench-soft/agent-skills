"""Tests for the repo checks in scripts/.

mise x -- python -m unittest discover -s tests
"""

import importlib.util
import unittest
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent.parent / "scripts"


def load(name: str):
    # The scripts have dashes in their names, so a plain import can't reach them.
    spec = importlib.util.spec_from_file_location(name.replace("-", "_"), SCRIPTS / f"{name}.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


budget = load("check-prose-budget")


class ProseBudget(unittest.TestCase):
    def test_fence_lines_are_free(self):
        self.assertEqual(budget.count_prose_lines("a\n\n```sh\nx\ny\n```\nb\n"), 2)

    def test_fence_inside_a_list_item_is_free(self):
        self.assertEqual(budget.count_prose_lines("- a\n  ```markdown\n  x\n  ```\n"), 1)


if __name__ == "__main__":
    unittest.main()
