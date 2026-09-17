"""
OptiForge 2026 - Starter Template
Track 2: Particle Swarm Optimization (PSO) - Continuous Non-linear Landscape
Organized by IEEE EMBS Student Chapter × IEEE CIS Local Chapter, VCE
"""

import random
import math

class Particle:
    def __init__(self, bounds):
        self.dim = len(bounds)
        self.position = [random.uniform(bounds[i][0], bounds[i][1]) for i in range(self.dim)]
        self.velocity = [random.uniform(-1.0, 1.0) for _ in range(self.dim)]
        self.pbest_position = self.position[:]
        self.pbest_fitness = math.inf

class ParticleSwarmOptimizer:
    def __init__(self, num_particles=40, max_iter=100, w=0.729, c1=1.49445, c2=1.49445):
        self.num_particles = num_particles
        self.max_iter = max_iter
        self.w = w     # Inertia weight
        self.c1 = c1   # Cognitive component
        self.c2 = c2   # Social component
        self.gbest_position = None
        self.gbest_fitness = math.inf

    def fitness_function(self, x):
        """
        Benchmark objective: Multi-modal Rastrigin Function
        f(x) = 10*n + sum(x_i^2 - 10*cos(2*pi*x_i))
        Global minimum is at x = [0, 0, ..., 0] where f(x) = 0
        """
        n = len(x)
        return 10 * n + sum(xi**2 - 10 * math.cos(2 * math.pi * xi) for xi in x)

    def optimize(self, bounds=[(-5.12, 5.12)] * 6):
        swarm = [Particle(bounds) for _ in range(self.num_particles)]
        
        for particle in swarm:
            fit = self.fitness_function(particle.position)
            particle.pbest_fitness = fit
            if fit < self.gbest_fitness:
                self.gbest_fitness = fit
                self.gbest_position = particle.position[:]

        for t in range(self.max_iter):
            # Dynamic inertia damping
            w_current = self.w * (0.99 ** t)
            
            for p in swarm:
                for i in range(len(bounds)):
                    r1 = random.random()
                    r2 = random.random()
                    
                    # Velocity update
                    cognitive = self.c1 * r1 * (p.pbest_position[i] - p.position[i])
                    social = self.c2 * r2 * (self.gbest_position[i] - p.position[i])
                    p.velocity[i] = w_current * p.velocity[i] + cognitive + social
                    
                    # Velocity clamping
                    v_max = (bounds[i][1] - bounds[i][0]) * 0.2
                    p.velocity[i] = max(-v_max, min(v_max, p.velocity[i]))
                    
                    # Position update
                    p.position[i] += p.velocity[i]
                    p.position[i] = max(bounds[i][0], min(bounds[i][1], p.position[i]))
                    
                fit = self.fitness_function(p.position)
                if fit < p.pbest_fitness:
                    p.pbest_fitness = fit
                    p.pbest_position = p.position[:]
                    
                if fit < self.gbest_fitness:
                    self.gbest_fitness = fit
                    self.gbest_position = p.position[:]

        return self.gbest_position, self.gbest_fitness

# Benchmark entrypoint
if __name__ == "__main__":
    pso = ParticleSwarmOptimizer(num_particles=50, max_iter=120)
    best_pos, best_val = pso.optimize()
    print(f"Optimal Value: {best_val:.5f} at Position: {[round(v, 3) for v in best_pos]}")
    best_solution = best_pos
    best_fitness = best_val
