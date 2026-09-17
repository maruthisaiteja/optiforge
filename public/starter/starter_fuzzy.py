"""
OptiForge 2026 - Starter Template
Track 4: Fuzzy Logic (FL) - Non-linear Dynamic Control & Inference
Organized by IEEE EMBS Student Chapter × IEEE CIS Local Chapter, VCE
"""

import math

class FuzzyMembership:
    @staticmethod
    def trimf(x, params):
        """Triangular membership function: params = [a, b, c]"""
        a, b, c = params
        if x <= a or x >= c:
            return 0.0
        elif a < x <= b:
            return (x - a) / (b - a) if b > a else 1.0
        else:
            return (c - x) / (c - b) if c > b else 1.0

    @staticmethod
    def trapmf(x, params):
        """Trapezoidal membership function: params = [a, b, c, d]"""
        a, b, c, d = params
        if x <= a or x >= d:
            return 0.0
        elif a < x < b:
            return (x - a) / (b - a)
        elif b <= x <= c:
            return 1.0
        else:
            return (d - x) / (d - c)

class MamdaniFuzzyController:
    def __init__(self):
        # Input Error membership ranges: Negative (NB, NS), Zero (ZE), Positive (PS, PB)
        self.error_sets = {
            "NB": [-10.0, -10.0, -5.0, 0.0],
            "ZE": [-3.0, 0.0, 3.0],
            "PB": [0.0, 5.0, 10.0, 10.0]
        }
        # Output Control force ranges
        self.control_actions = {
            "NB": -20.0,
            "ZE": 0.0,
            "PB": 20.0
        }

    def fuzzify(self, error):
        mu = {}
        mu["NB"] = FuzzyMembership.trapmf(error, self.error_sets["NB"])
        mu["ZE"] = FuzzyMembership.trimf(error, self.error_sets["ZE"])
        mu["PB"] = FuzzyMembership.trapmf(error, self.error_sets["PB"])
        return mu

    def evaluate_rules(self, mu):
        # Rule Base:
        # If Error is NB -> Action is PB (counteract)
        # If Error is ZE -> Action is ZE
        # If Error is PB -> Action is NB (counteract)
        fired = {
            "NB": mu["PB"],
            "ZE": mu["ZE"],
            "PB": mu["NB"]
        }
        return fired

    def defuzzify_centroid(self, fired_rules):
        """Centroid (Center of Gravity) defuzzification"""
        numerator = sum(fired_rules[k] * self.control_actions[k] for k in fired_rules)
        denominator = sum(fired_rules.values())
        if denominator == 0:
            return 0.0
        return numerator / denominator

    def compute_control(self, error):
        mu = self.fuzzify(error)
        rules = self.evaluate_rules(mu)
        return self.defuzzify_centroid(rules)

    def simulate_step_response(self, setpoint=10.0, steps=50):
        """Simulate dynamic feedback control loop"""
        current = 0.0
        history = []
        for _ in range(steps):
            error = setpoint - current
            u = self.compute_control(error)
            # Simple 1st-order inertia system: x(t+1) = 0.85*x(t) + 0.15*u
            current = 0.85 * current + 0.15 * u
            history.append(current)
        return history

# Benchmark entrypoint
if __name__ == "__main__":
    controller = MamdaniFuzzyController()
    response = controller.simulate_step_response(setpoint=15.0)
    final_error = abs(15.0 - response[-1])
    print(f"Final Steady-State Error: {final_error:.4f}")
    result = response
    best_cost = final_error
    best_solution = response
