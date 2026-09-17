"""
OptiForge 2026 - Starter Template
Problem 3: Emergency Hospital Destination Selection Under Dynamic Capacity
Society: IEEE EMBS × IEEE CIS | Track: Advanced
Technique: Fuzzy Logic + Particle Swarm Optimization
"""

import random
import math

class HospitalDestinationSelector:
    def __init__(self):
        # Candidate hospitals with dynamic capacities and specialist states
        self.hospitals = [
            {"name": "City General Hospital", "dist_km": 6.5, "er_queue_mins": 45, "icu_avail": 2, "specialist": True},
            {"name": "Apex Trauma Center", "dist_km": 14.2, "er_queue_mins": 10, "icu_avail": 5, "specialist": True},
            {"name": "Care Community Hospital", "dist_km": 3.0, "er_queue_mins": 25, "icu_avail": 0, "specialist": False},
        ]
        self.best_destination = None
        self.best_treatment_delay = math.inf

    def fuzzy_concurrency_score(self, travel_time, er_queue, icu_count, patient_triage=1):
        """
        Fuzzy inference model calculating expected total minutes to definitive treatment.
        Travel time + Queue delay adjusted by ICU and clinical risk urgency.
        """
        urgency_multiplier = 1.8 if patient_triage == 1 else 1.0
        
        # Fuzzy queue penalty
        if icu_count == 0:
            diversion_risk = 50.0
        else:
            diversion_risk = 0.0

        expected_treatment_mins = (travel_time * 2.2) + er_queue + diversion_risk
        return expected_treatment_mins * urgency_multiplier

    def select_optimal_hospital(self, patient_triage=1):
        scores = []
        for h in self.hospitals:
            score = self.fuzzy_concurrency_score(
                h["dist_km"], h["er_queue_mins"], h["icu_avail"], patient_triage
            )
            scores.append((h["name"], score))

        # Select hospital minimizing expected time to treatment
        best_choice = min(scores, key=lambda item: item[1])
        self.best_destination = best_choice[0]
        self.best_treatment_delay = best_choice[1]
        return self.best_destination, self.best_treatment_delay

if __name__ == "__main__":
    selector = HospitalDestinationSelector()
    hospital, delay = selector.select_optimal_hospital(patient_triage=1)
    print(f"Optimal Hospital Selected: {hospital} with Expected Delay: {delay:.1f} mins")
    best_solution = hospital
    best_cost = delay
