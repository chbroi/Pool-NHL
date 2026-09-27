import subprocess

scripts = [

    "update_playoff_structure.py",

    "update_round1.py",

    "update_playoff_results.py",

    "update_players.py"

]

for script in scripts:

    print(
        f"\n===== {script} ====="
    )

    subprocess.run(
        ["python", script],
        check=True
    )

print(
    "\nAll updates completed"
)