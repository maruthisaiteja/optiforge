"""
OptiForge 2026 - Starter Template
Track 3: Ant Colony Optimization (ACO) - Combinatorial Graph Routing
Organized by IEEE EMBS Student Chapter × IEEE CIS Local Chapter, VCE
"""

import random
import math

class AntColonyOptimizer:
    def __init__(self, num_ants=25, num_iterations=80, alpha=1.0, beta=2.5, rho=0.1, q0=0.9):
        self.num_ants = num_ants
        self.num_iterations = num_iterations
        self.alpha = alpha  # Pheromone importance
        self.beta = beta    # Heuristic distance importance
        self.rho = rho      # Pheromone evaporation rate
        self.q0 = q0        # Exploitation vs exploration probability
        self.best_tour = None
        self.best_cost = math.inf

    def compute_distance_matrix(self, coordinates):
        n = len(coordinates)
        dist = [[0.0] * n for _ in range(n)]
        for i in range(n):
            for j in range(n):
                if i != j:
                    dx = coordinates[i][0] - coordinates[j][0]
                    dy = coordinates[i][1] - coordinates[j][1]
                    dist[i][j] = math.sqrt(dx * dx + dy * dy)
                else:
                    dist[i][j] = 1e-6
        return dist

    def optimize(self, coordinates=None):
        # Generate sample 16-node city graph if none provided
        if not coordinates:
            random.seed(42)
            coordinates = [(random.uniform(10, 90), random.uniform(10, 90)) for _ in range(16)]
            
        n = len(coordinates)
        distances = self.compute_distance_matrix(coordinates)
        pheromones = [[1.0 / (n * 10.0)] * n for _ in range(n)]

        for it in range(self.num_iterations):
            all_tours = []
            all_costs = []

            for ant in range(self.num_ants):
                visited = [False] * n
                start_node = random.randint(0, n - 1)
                tour = [start_node]
                visited[start_node] = True

                for step in range(n - 1):
                    current = tour[-1]
                    # Transition probabilities
                    probs = []
                    candidates = [c for c in range(n) if not visited[c]]
                    
                    for cand in candidates:
                        tau = pheromones[current][cand] ** self.alpha
                        eta = (1.0 / distances[current][cand]) ** self.beta
                        probs.append(tau * eta)
                        
                    total_prob = sum(probs)
                    if total_prob == 0:
                        chosen = random.choice(candidates)
                    else:
                        r = random.uniform(0, total_prob)
                        cum = 0.0
                        chosen = candidates[-1]
                        for c, p in zip(candidates, probs):
                            cum += p
                            if cum >= r:
                                chosen = c
                                break
                                
                    tour.append(chosen)
                    visited[chosen] = True

                # Tour total distance
                cost = sum(distances[tour[k]][tour[(k + 1) % n]] for k in range(n))
                all_tours.append(tour)
                all_costs.append(cost)

                if cost < self.best_cost:
                    self.best_cost = cost
                    self.best_tour = tour[:]

            # Pheromone evaporation
            for i in range(n):
                for j in range(n):
                    pheromones[i][j] *= (1.0 - self.rho)

            # Pheromone deposit by best ant (Elitist ACO)
            for k in range(n):
                i = self.best_tour[k]
                j = self.best_tour[(k + 1) % n]
                pheromones[i][j] += (1.0 / self.best_cost)
                pheromones[j][i] += (1.0 / self.best_cost)

        return self.best_tour, self.best_cost

# Benchmark entrypoint
if __name__ == "__main__":
    aco = AntColonyOptimizer(num_ants=20, num_iterations=50)
    best_path, min_len = aco.optimize()
    print(f"Optimal Tour Length: {min_len:.3f}")
    best_solution = best_path
    best_cost = min_len
