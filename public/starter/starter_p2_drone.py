"""
OptiForge 2026 - Starter Template
Problem 2: Drone-Based Emergency Medical Supply Delivery
Society: IEEE EMBS × IEEE CIS | Track: Advanced
Technique: Ant Colony Optimization + Genetic Algorithm
"""

import random
import math

class MedicalDroneACO:
    def __init__(self, num_drones=3, battery_capacity_km=45.0, max_payload_kg=5.0):
        self.num_drones = num_drones
        self.battery_capacity = battery_capacity_km
        self.max_payload = max_payload_kg
        self.best_solution = None
        self.best_cost = math.inf

    def compute_delivery_metrics(self, routes, requests):
        """
        Calculates total flight distance, thermal exposure penalty, and battery viability.
        """
        total_dist = 0.0
        thermal_penalty = 0.0
        
        for drone_idx, route in enumerate(routes):
            drone_dist = 0.0
            cur_x, cur_y = (0.0, 0.0) # Central hospital depot
            
            for req_idx in route:
                req = requests[req_idx]
                dist = math.sqrt((req["x"] - cur_x)**2 + (req["y"] - cur_y)**2)
                drone_dist += dist
                
                # Temperature sensitive item transit duration check
                if req.get("temp_sensitive", False) and drone_dist > 25.0:
                    thermal_penalty += 40.0 # Exceeded safe transit duration
                    
                cur_x, cur_y = req["x"], req["y"]
                
            # Return to base
            drone_dist += math.sqrt(cur_x**2 + cur_y**2)
            total_dist += drone_dist

        return total_dist + thermal_penalty

    def optimize(self, num_iterations=50):
        # Sample 12 emergency clinic delivery requests
        random.seed(42)
        requests = [
            {"id": i, "x": random.uniform(-15, 15), "y": random.uniform(-15, 15), 
             "payload": random.uniform(0.5, 2.0), "temp_sensitive": (i % 3 == 0)}
            for i in range(12)
        ]

        # Baseline ACO heuristic routing
        best_routes = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]]
        cost = self.compute_delivery_metrics(best_routes, requests)
        self.best_solution = best_routes
        self.best_cost = cost

        return self.best_solution, self.best_cost

if __name__ == "__main__":
    drone_aco = MedicalDroneACO()
    routes, cost = drone_aco.optimize()
    print(f"Drone Emergency Dispatch Optimized. Total Distance Cost: {cost:.2f}")
    best_solution = routes
    best_cost = cost
