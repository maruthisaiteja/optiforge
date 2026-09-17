"""
OptiForge 2026 - Starter Template
Problem 5: Multi-Robot Search-and-Rescue Area Coverage (Flagship Showcase)
Society: IEEE EMBS × IEEE CIS | Track: Advanced
Technique: PSO / ACO / Multi-Agent Genetic Algorithm
"""

import random
import math

class MultiRobotSearchRescue:
    def __init__(self, grid_size=(20, 20), num_robots=4, battery_budget_steps=80):
        self.width, self.height = grid_size
        self.num_robots = num_robots
        self.battery_budget = battery_budget_steps
        self.obstacles = set([(5, 5), (5, 6), (5, 7), (12, 10), (12, 11), (15, 14)])
        self.survivors = set([(3, 16), (17, 4), (18, 18)])
        self.best_trajectories = None
        self.best_coverage_score = 0.0

    def evaluate_trajectories(self, trajectories):
        """
        Evaluates survivor detection probability, total unique area covered, 
        and penalizes redundant overlap and hazardous zone collisions.
        """
        covered_cells = set()
        survivors_found = 0
        collision_penalties = 0.0
        overlap_count = 0

        for r_idx, path in enumerate(trajectories):
            for step, (x, y) in enumerate(path):
                if (x, y) in self.obstacles:
                    collision_penalties += 50.0
                if (x, y) in self.survivors:
                    survivors_found += 1
                if (x, y) in covered_cells:
                    overlap_count += 1
                else:
                    covered_cells.add((x, y))

        coverage_ratio = len(covered_cells) / (self.width * self.height - len(self.obstacles))
        score = (coverage_ratio * 50.0) + (survivors_found * 20.0) - (overlap_count * 0.2) - collision_penalties
        return max(0.0, score)

    def optimize(self):
        # Baseline heuristic sector partitioning
        trajectories = []
        for r in range(self.num_robots):
            # Each robot covers a quad quadrant
            start_x = (r % 2) * 10
            start_y = (r // 2) * 10
            path = [(min(19, start_x + (s % 10)), min(19, start_y + (s // 10))) for s in range(50)]
            trajectories.append(path)

        score = self.evaluate_trajectories(trajectories)
        self.best_trajectories = trajectories
        self.best_coverage_score = score
        return trajectories, score

if __name__ == "__main__":
    sar = MultiRobotSearchRescue()
    paths, score = sar.optimize()
    print(f"Multi-Robot Disaster Area Coverage Optimized. Score: {score:.2f}")
    best_solution = paths
    best_fitness = score
