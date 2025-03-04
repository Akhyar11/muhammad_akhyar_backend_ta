"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Service for anthropometry
class AnthropometryService {
    // Calculate BMI
    calculateBMI(height, weight) {
        return weight / Math.pow(height / 100, 2);
    }
}
exports.default = AnthropometryService;
