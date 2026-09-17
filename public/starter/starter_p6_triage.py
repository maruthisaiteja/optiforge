"""
OptiForge 2026 - Starter Template
Problem 6: Fuzzy Emergency-Room Triage with Adaptive Rule Optimization
Society: IEEE EMBS × IEEE CIS | Track: Advanced
Technique: Fuzzy Logic + Genetic Algorithm
"""

import random
import math

class FuzzyERTriageSystem:
    def __init__(self):
        # Vital sign parameter membership definitions
        # Heart Rate: Low, Normal, High
        # O2 Saturation: Critical (<90), Hypoxic (90-94), Normal (>94)
        # Systolic Blood Pressure: Hypotensive, Normal, Hypertensive
        self.best_rule_base = None
        self.best_accuracy = 0.0

    def evaluate_patient_triage(self, hr, spo2, sbp, temp):
        """
        Computes continuous fuzzy triage priority (1 = Resuscitation, 5 = Non-urgent).
        """
        # Fuzzy membership evaluations
        mu_hypoxia = max(0.0, min(1.0, (94.0 - spo2) / 8.0))
        mu_tachycardia = max(0.0, min(1.0, (hr - 100.0) / 30.0))
        mu_hypotension = max(0.0, min(1.0, (90.0 - sbp) / 20.0))

        # Combined critical risk severity
        risk_index = max(mu_hypoxia, mu_hypotension) * 0.7 + mu_tachycardia * 0.3

        if risk_index > 0.75:
            return 1 # Immediate Resuscitation
        elif risk_index > 0.50:
            return 2 # Emergent
        elif risk_index > 0.25:
            return 3 # Urgent
        else:
            return 4 # Standard

    def evaluate_triage_dataset(self, test_patients):
        """
        Tests triage priority accuracy and penalizes under-triage of critical patients.
        """
        correct = 0
        under_triage_penalty = 0.0

        for p in test_patients:
            predicted = self.evaluate_patient_triage(p["hr"], p["spo2"], p["sbp"], p["temp"])
            if predicted == p["true_triage"]:
                correct += 1
            elif predicted > p["true_triage"]:
                under_triage_penalty += 25.0 # Under-triage is medically hazardous

        accuracy = (correct / len(test_patients)) * 100.0 - under_triage_penalty
        return max(0.0, accuracy)

    def optimize(self):
        sample_patients = [
            {"hr": 125, "spo2": 88, "sbp": 85, "temp": 38.5, "true_triage": 1},
            {"hr": 78, "spo2": 98, "sbp": 120, "temp": 37.0, "true_triage": 4},
            {"hr": 105, "spo2": 92, "sbp": 105, "temp": 39.1, "true_triage": 2},
            {"hr": 92, "spo2": 95, "sbp": 115, "temp": 37.4, "true_triage": 3},
        ]
        score = self.evaluate_triage_dataset(sample_patients)
        self.best_accuracy = score
        return "Adaptive_Mamdani_Rules", score

if __name__ == "__main__":
    triage = FuzzyERTriageSystem()
    rules, score = triage.optimize()
    print(f"Fuzzy ER Triage Rule Base Evaluated. Score: {score:.2f}")
    best_solution = rules
    best_fitness = score
