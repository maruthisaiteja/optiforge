"""
OptiForge 2026 - Starter Template
Problem 4: Hospital Blood Inventory and Compatibility-Aware Allocation
Society: IEEE EMBS × IEEE CIS | Track: Advanced
Technique: Genetic Algorithm / Particle Swarm Optimization
"""

import random
import math

class BloodInventoryOptimizer:
    def __init__(self):
        # Blood compatibility matrix: Receiver -> Compatible Donors
        self.compatibility = {
            "O-": ["O-"],
            "O+": ["O-", "O+"],
            "A-": ["O-", "A-"],
            "A+": ["O-", "O+", "A-", "A+"],
            "B-": ["O-", "B-"],
            "B+": ["O-", "O+", "B-", "B+"],
            "AB-": ["O-", "A-", "B-", "AB-"],
            "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]
        }
        self.inventory = {"O-": 8, "O+": 25, "A+": 20, "B+": 18, "AB+": 6}
        self.best_policy = None
        self.best_fitness = -math.inf

    def evaluate_allocation_policy(self, substitution_thresholds, daily_requests):
        """
        Simulates inventory drawdown, substitutions, expiry wastage, and stockouts.
        """
        stockout_penalties = 0.0
        wastage_penalties = 0.0
        
        current_stock = dict(self.inventory)
        
        for req in daily_requests:
            grp = req["group"]
            units = req["units"]
            
            if current_stock.get(grp, 0) >= units:
                current_stock[grp] -= units
            else:
                # Attempt compatible substitution
                fulfilled = False
                for alt in self.compatibility.get(grp, []):
                    if current_stock.get(alt, 0) >= units:
                        current_stock[alt] -= units
                        fulfilled = True
                        break
                if not fulfilled:
                    stockout_penalties += 100.0 # Critical stockout penalty

        score = 100.0 - stockout_penalties - (wastage_penalties * 0.5)
        return max(0.0, score)

    def optimize(self):
        # Baseline simulation with sample daily hospital trauma demand
        sample_demand = [
            {"group": "O-", "units": 4},
            {"group": "A+", "units": 6},
            {"group": "B+", "units": 5},
            {"group": "O-", "units": 2}
        ]
        score = self.evaluate_allocation_policy(None, sample_demand)
        self.best_policy = "FIFO_Compatibility_Priority"
        self.best_fitness = score
        return self.best_policy, self.best_fitness

if __name__ == "__main__":
    optimizer = BloodInventoryOptimizer()
    policy, score = optimizer.optimize()
    print(f"Blood Inventory Policy Evaluated. Score: {score:.1f}")
    best_solution = policy
    best_fitness = score
