"""
OptiForge 2026 - Starter Template
Track 1: Genetic Algorithms (GA) - Combinatorial Optimization
Organized by IEEE EMBS Student Chapter × IEEE CIS Local Chapter, VCE
"""

import random
import math

class GeneticAlgorithmOptimizer:
    def __init__(self, population_size=50, generations=100, mutation_rate=0.05, crossover_rate=0.85):
        self.pop_size = population_size
        self.generations = generations
        self.mutation_rate = mutation_rate
        self.crossover_rate = crossover_rate
        self.best_solution = None
        self.best_fitness = -math.inf
        
    def initialize_population(self, chromosome_length):
        """Generate an initial population of binary or permutation chromosomes"""
        return [[random.randint(0, 1) for _ in range(chromosome_length)] for _ in range(self.pop_size)]
        
    def evaluate_fitness(self, chromosome):
        """
        Custom fitness function for 0/1 multi-constraint optimization.
        TODO: Customize for maximum value under knapsack/weight constraints!
        """
        # Example objective: OneMax / Knapsack value
        return sum(chromosome)

    def selection(self, population, fitnesses):
        """Roulette wheel or Tournament selection"""
        tournament_size = 3
        selected = []
        for _ in range(self.pop_size):
            aspirants = random.sample(list(range(self.pop_size)), tournament_size)
            winner = max(aspirants, key=lambda idx: fitnesses[idx])
            selected.append(population[winner][:])
        return selected

    def crossover(self, parent1, parent2):
        """Single-point or Two-point crossover"""
        if random.random() < self.crossover_rate:
            pt = random.randint(1, len(parent1) - 1)
            child1 = parent1[:pt] + parent2[pt:]
            child2 = parent2[:pt] + parent1[pt:]
            return child1, child2
        return parent1[:], parent2[:]

    def mutate(self, chromosome):
        """Bit-flip mutation with mutation_rate probability"""
        for i in range(len(chromosome)):
            if random.random() < self.mutation_rate:
                chromosome[i] = 1 - chromosome[i]
        return chromosome

    def optimize(self, chromosome_length=64):
        """Main GA execution loop"""
        population = self.initialize_population(chromosome_length)
        
        for gen in range(self.generations):
            fitnesses = [self.evaluate_fitness(ind) for ind in population]
            
            # Track best individual (Elitism)
            max_fit = max(fitnesses)
            if max_fit > self.best_fitness:
                self.best_fitness = max_fit
                self.best_solution = population[fitnesses.index(max_fit)][:]
            
            # Selection
            selected_pop = self.selection(population, fitnesses)
            
            # Reproduction
            next_pop = []
            for i in range(0, self.pop_size, 2):
                p1 = selected_pop[i]
                p2 = selected_pop[(i + 1) % self.pop_size]
                c1, c2 = self.crossover(p1, p2)
                next_pop.append(self.mutate(c1))
                next_pop.append(self.mutate(c2))
                
            population = next_pop[:self.pop_size]
            
        return self.best_solution, self.best_fitness

# Benchmark entrypoint
if __name__ == "__main__":
    ga = GeneticAlgorithmOptimizer(population_size=60, generations=80)
    best_sol, best_fit = ga.optimize()
    print(f"Optimal Fitness: {best_fit}")
    best_solution = best_sol
    best_fitness = best_fit
