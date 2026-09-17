"""
OptiForge 2026 - Starter Template
Problem 1: Hospital Staff Scheduling with Fatigue-Aware Optimization
Society: IEEE EMBS × IEEE CIS | Track: Intermediate–Advanced
Technique: Genetic Algorithm + Fuzzy Fatigue Model
"""

import random
import math

class HospitalStaffSchedulerGA:
    def __init__(self, num_staff=24, num_days=7, shifts_per_day=3):
        self.num_staff = num_staff
        self.num_days = num_days
        self.shifts_per_day = shifts_per_day
        self.total_shifts = num_days * shifts_per_day
        self.best_solution = None
        self.best_fitness = -math.inf

    def fuzzy_fatigue_score(self, consecutive_shifts, night_shifts_worked, rest_hours):
        """
        Fuzzy fatigue model evaluating cumulative workload and sleep deprivation risk.
        Low fatigue -> score ~0.0, Extreme fatigue -> score ~1.0
        """
        # Linguistic fuzzy rule approximation
        mu_consecutive = min(1.0, max(0.0, (consecutive_shifts - 2) / 3.0))
        mu_night = min(1.0, max(0.0, night_shifts_worked / 3.0))
        mu_rest = min(1.0, max(0.0, (12.0 - rest_hours) / 12.0))
        
        # Weighted aggregate fuzzy risk
        fatigue_risk = (0.45 * mu_consecutive) + (0.35 * mu_night) + (0.20 * mu_rest)
        return fatigue_risk

    def evaluate_schedule(self, chromosome):
        """
        Evaluates hard coverage constraints and fuzzy fatigue penalties.
        """
        # Hard constraint: Each shift requires minimum staffing (e.g. 4 staff)
        min_staff_required = 4
        penalty = 0.0
        
        # Compute staffing per shift
        for shift_idx in range(self.total_shifts):
            assigned = sum(1 for emp in range(self.num_staff) if chromosome[emp][shift_idx] == 1)
            if assigned < min_staff_required:
                penalty += (min_staff_required - assigned) * 50.0

        # Compute fuzzy fatigue for each employee
        total_fatigue = 0.0
        for emp in range(self.num_staff):
            emp_shifts = chromosome[emp]
            consecutive = 0
            nights = 0
            for day in range(self.num_days):
                day_shifts = emp_shifts[day * 3 : (day + 1) * 3]
                if sum(day_shifts) > 1:
                    penalty += 30.0 # Overlapping shift violation
                if day_shifts[2] == 1:
                    nights += 1
                if sum(day_shifts) > 0:
                    consecutive += 1
                else:
                    consecutive = 0
            total_fatigue += self.fuzzy_fatigue_score(consecutive, nights, 14.0)

        # Objective: Maximize coverage satisfaction while minimizing fatigue and overtime
        fitness = 100.0 - penalty - (total_fatigue * 2.5)
        return max(0.0, fitness)

    def optimize(self, population_size=40, generations=60):
        # Initialize binary assignment matrix [num_staff x total_shifts]
        population = [
            [[random.randint(0, 1) for _ in range(self.total_shifts)] for _ in range(self.num_staff)]
            for _ in range(population_size)
        ]

        for gen in range(generations):
            fitnesses = [self.evaluate_schedule(ind) for ind in population]
            best_idx = max(range(population_size), key=lambda i: fitnesses[i])
            
            if fitnesses[best_idx] > self.best_fitness:
                self.best_fitness = fitnesses[best_idx]
                self.best_solution = population[best_idx]

        return self.best_solution, self.best_fitness

if __name__ == "__main__":
    scheduler = HospitalStaffSchedulerGA()
    solution, fitness = scheduler.optimize(population_size=30, generations=40)
    print(f"Hospital Staff Schedule Optimized. Score: {fitness:.2f}")
    best_solution = solution
    best_fitness = fitness
