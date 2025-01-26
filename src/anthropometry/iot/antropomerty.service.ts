// Service for anthropometry
export default class AnthropometryService {
  // Calculate BMI
  calculateBMI(height: number, weight: number) {
    return weight / Math.pow(height / 100, 2);
  }
}
