"""
Soul Stat Saju Engine Package
Modular architecture: Calculator -> Interpreter -> Generator
"""
from .calculator import SajuCalculator
from .interpreter import SajuInterpreter
from .generator import DeepReportGenerator

class SajuEngine:
    """
    Unified facade for the Saju analysis pipeline.
    Delegates to Calculator, Interpreter, and Generator modules.
    """
    def __init__(self):
        self.calculator = SajuCalculator()
        self.interpreter = SajuInterpreter()
        self.generator = DeepReportGenerator()

    def compute_saju(self, year, month, day, hour, minute=0):
        return self.calculator.compute(year, month, day, hour, minute)

    def analyze_stats(self, pillars_data):
        return self.interpreter.analyze(pillars_data)

    def generate_deep_report(self, pillars_data):
        return self.generator.generate(pillars_data)
