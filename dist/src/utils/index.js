"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBMI = calculateBMI;
exports.calculateAge = calculateAge;
exports.calculateKMSStatus = calculateKMSStatus;
exports.interpolateWeight = interpolateWeight;
exports.calculateHeightStatus = calculateHeightStatus;
exports.interpolateHeight = interpolateHeight;
exports.calculateWeightForHeightStatus = calculateWeightForHeightStatus;
exports.calculateBMIForAgeStatus = calculateBMIForAgeStatus;
function calculateBMI(height, weight) {
    return `${weight / Math.pow(height / 100, 2)}`;
}
// Calculate age from date at format {age: number, months: number}
function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
        age--;
        months += 12;
    }
    if (today.getDate() < birthDate.getDate()) {
        months--;
    }
    return { age, months };
}
function calculateKMSStatus(ageInMonths, weightInKg, gender) {
    // KMS reference data for boys (age in months, weight in kg)
    const kmsReferenceBoy = {
        // -3SD (severely underweight)
        severelyUnderweight: [
            { age: 0, weight: 2.1 },
            { age: 2, weight: 3.4 },
            { age: 4, weight: 4.4 },
            { age: 6, weight: 5.3 },
            { age: 8, weight: 6.0 },
            { age: 10, weight: 6.6 },
            { age: 12, weight: 7.1 },
            { age: 24, weight: 9.0 },
            { age: 36, weight: 10.8 },
            { age: 48, weight: 12.2 },
            { age: 60, weight: 13.7 },
        ],
        // -2SD (underweight)
        underweight: [
            { age: 0, weight: 2.5 },
            { age: 2, weight: 4.3 },
            { age: 4, weight: 5.6 },
            { age: 6, weight: 6.4 },
            { age: 8, weight: 7.1 },
            { age: 10, weight: 7.7 },
            { age: 12, weight: 8.3 },
            { age: 24, weight: 10.5 },
            { age: 36, weight: 12.7 },
            { age: 48, weight: 14.3 },
            { age: 60, weight: 16.0 },
        ],
        // Median
        normal: [
            { age: 0, weight: 3.3 },
            { age: 2, weight: 5.5 },
            { age: 4, weight: 7.0 },
            { age: 6, weight: 7.9 },
            { age: 8, weight: 8.7 },
            { age: 10, weight: 9.4 },
            { age: 12, weight: 10.0 },
            { age: 24, weight: 12.4 },
            { age: 36, weight: 14.6 },
            { age: 48, weight: 16.7 },
            { age: 60, weight: 18.7 },
        ],
        // +2SD (overweight)
        overweight: [
            { age: 0, weight: 4.2 },
            { age: 2, weight: 7.0 },
            { age: 4, weight: 8.6 },
            { age: 6, weight: 9.8 },
            { age: 8, weight: 10.7 },
            { age: 10, weight: 11.6 },
            { age: 12, weight: 12.4 },
            { age: 24, weight: 15.0 },
            { age: 36, weight: 17.4 },
            { age: 48, weight: 19.8 },
            { age: 60, weight: 22.4 },
        ],
    };
    // KMS reference data for girls (age in months, weight in kg)
    const kmsReferenceGirl = {
        // -3SD (severely underweight)
        severelyUnderweight: [
            { age: 0, weight: 2.0 },
            { age: 2, weight: 3.2 },
            { age: 4, weight: 4.2 },
            { age: 6, weight: 4.9 },
            { age: 8, weight: 5.5 },
            { age: 10, weight: 6.0 },
            { age: 12, weight: 6.5 },
            { age: 24, weight: 8.5 },
            { age: 36, weight: 10.2 },
            { age: 48, weight: 11.7 },
            { age: 60, weight: 13.0 },
        ],
        // -2SD (underweight)
        underweight: [
            { age: 0, weight: 2.4 },
            { age: 2, weight: 3.9 },
            { age: 4, weight: 5.1 },
            { age: 6, weight: 5.9 },
            { age: 8, weight: 6.6 },
            { age: 10, weight: 7.2 },
            { age: 12, weight: 7.7 },
            { age: 24, weight: 9.9 },
            { age: 36, weight: 11.9 },
            { age: 48, weight: 13.5 },
            { age: 60, weight: 15.1 },
        ],
        // Median
        normal: [
            { age: 0, weight: 3.2 },
            { age: 2, weight: 5.0 },
            { age: 4, weight: 6.4 },
            { age: 6, weight: 7.3 },
            { age: 8, weight: 8.0 },
            { age: 10, weight: 8.7 },
            { age: 12, weight: 9.3 },
            { age: 24, weight: 11.8 },
            { age: 36, weight: 14.1 },
            { age: 48, weight: 16.1 },
            { age: 60, weight: 18.0 },
        ],
        // +2SD (overweight)
        overweight: [
            { age: 0, weight: 4.2 },
            { age: 2, weight: 6.5 },
            { age: 4, weight: 8.1 },
            { age: 6, weight: 9.3 },
            { age: 8, weight: 10.2 },
            { age: 10, weight: 11.0 },
            { age: 12, weight: 11.7 },
            { age: 24, weight: 14.4 },
            { age: 36, weight: 16.9 },
            { age: 48, weight: 19.4 },
            { age: 60, weight: 21.7 },
        ],
    };
    // Select reference data based on gender
    const referenceData = gender.toLowerCase() === "male" ? kmsReferenceBoy : kmsReferenceGirl;
    // Find the closest age index in the reference data
    // If exact age isn't in the data, find the first age that's greater than or equal to child's age
    const closestAgeIndex = referenceData.normal.findIndex((data) => data.age >= ageInMonths);
    // If child's age is beyond the reference data, return Unknown
    if (closestAgeIndex === -1)
        return "Unknown";
    // If child's age is between two reference points, use linear interpolation
    let severelyUnderweightThreshold, underweightThreshold, overweightThreshold;
    // Get the exact or next higher age reference point
    const exactMatchAge = referenceData.normal[closestAgeIndex].age === ageInMonths;
    if (exactMatchAge || closestAgeIndex === 0) {
        // If exact age match or it's the first entry, use direct values
        severelyUnderweightThreshold =
            referenceData.severelyUnderweight[closestAgeIndex].weight;
        underweightThreshold = referenceData.underweight[closestAgeIndex].weight;
        overweightThreshold = referenceData.overweight[closestAgeIndex].weight;
    }
    else {
        // Use linear interpolation between the two closest age points
        const lowerIndex = closestAgeIndex - 1;
        const upperIndex = closestAgeIndex;
        const lowerAge = referenceData.normal[lowerIndex].age;
        const upperAge = referenceData.normal[upperIndex].age;
        // Calculate position between lower and upper age (0-1)
        const ageRatio = (ageInMonths - lowerAge) / (upperAge - lowerAge);
        // Interpolate thresholds
        severelyUnderweightThreshold = interpolateWeight(referenceData.severelyUnderweight[lowerIndex].weight, referenceData.severelyUnderweight[upperIndex].weight, ageRatio);
        underweightThreshold = interpolateWeight(referenceData.underweight[lowerIndex].weight, referenceData.underweight[upperIndex].weight, ageRatio);
        overweightThreshold = interpolateWeight(referenceData.overweight[lowerIndex].weight, referenceData.overweight[upperIndex].weight, ageRatio);
    }
    // Determine status based on weight thresholds
    if (weightInKg < severelyUnderweightThreshold)
        return "Severely Underweight";
    if (weightInKg < underweightThreshold)
        return "Underweight";
    if (weightInKg > overweightThreshold)
        return "Overweight";
    return "Normal";
}
function interpolateWeight(weight1, weight2, ratio) {
    return weight1 + (weight2 - weight1) * ratio;
}
function calculateHeightStatus(ageInMonths, heightInCm, gender) {
    // KMS reference data for boys' height (age in months, height in cm)
    const heightReferenceBoy = {
        // -3SD (severely stunted)
        severelyStunted: [
            { age: 0, height: 44.2 },
            { age: 2, height: 51.1 },
            { age: 4, height: 56.0 },
            { age: 6, height: 60.0 },
            { age: 8, height: 62.8 },
            { age: 10, height: 65.3 },
            { age: 12, height: 67.6 },
            { age: 24, height: 77.0 },
            { age: 36, height: 83.9 },
            { age: 48, height: 89.4 },
            { age: 60, height: 94.1 },
        ],
        // -2SD (stunted)
        stunted: [
            { age: 0, height: 46.1 },
            { age: 2, height: 53.4 },
            { age: 4, height: 58.6 },
            { age: 6, height: 62.5 },
            { age: 8, height: 65.7 },
            { age: 10, height: 68.0 },
            { age: 12, height: 70.2 },
            { age: 24, height: 80.0 },
            { age: 36, height: 87.1 },
            { age: 48, height: 93.4 },
            { age: 60, height: 98.9 },
        ],
        // Median
        normal: [
            { age: 0, height: 49.9 },
            { age: 2, height: 58.4 },
            { age: 4, height: 63.9 },
            { age: 6, height: 68.0 },
            { age: 8, height: 71.3 },
            { age: 10, height: 73.8 },
            { age: 12, height: 76.0 },
            { age: 24, height: 86.8 },
            { age: 36, height: 94.9 },
            { age: 48, height: 102.3 },
            { age: 60, height: 109.2 },
        ],
        // +2SD (tall)
        tall: [
            { age: 0, height: 53.7 },
            { age: 2, height: 63.3 },
            { age: 4, height: 69.2 },
            { age: 6, height: 73.5 },
            { age: 8, height: 76.9 },
            { age: 10, height: 79.6 },
            { age: 12, height: 81.8 },
            { age: 24, height: 93.6 },
            { age: 36, height: 102.7 },
            { age: 48, height: 111.3 },
            { age: 60, height: 119.4 },
        ],
    };
    // KMS reference data for girls' height (age in months, height in cm)
    const heightReferenceGirl = {
        // -3SD (severely stunted)
        severelyStunted: [
            { age: 0, height: 43.6 },
            { age: 2, height: 49.8 },
            { age: 4, height: 54.7 },
            { age: 6, height: 58.5 },
            { age: 8, height: 61.2 },
            { age: 10, height: 63.5 },
            { age: 12, height: 65.6 },
            { age: 24, height: 75.4 },
            { age: 36, height: 82.6 },
            { age: 48, height: 88.6 },
            { age: 60, height: 93.9 },
        ],
        // -2SD (stunted)
        stunted: [
            { age: 0, height: 45.4 },
            { age: 2, height: 52.0 },
            { age: 4, height: 57.0 },
            { age: 6, height: 60.9 },
            { age: 8, height: 63.7 },
            { age: 10, height: 66.0 },
            { age: 12, height: 68.2 },
            { age: 24, height: 78.4 },
            { age: 36, height: 85.9 },
            { age: 48, height: 92.2 },
            { age: 60, height: 98.2 },
        ],
        // Median
        normal: [
            { age: 0, height: 49.1 },
            { age: 2, height: 56.8 },
            { age: 4, height: 62.1 },
            { age: 6, height: 66.3 },
            { age: 8, height: 69.2 },
            { age: 10, height: 71.8 },
            { age: 12, height: 74.0 },
            { age: 24, height: 85.0 },
            { age: 36, height: 93.2 },
            { age: 48, height: 100.1 },
            { age: 60, height: 107.0 },
        ],
        // +2SD (tall)
        tall: [
            { age: 0, height: 52.9 },
            { age: 2, height: 61.1 },
            { age: 4, height: 67.0 },
            { age: 6, height: 71.6 },
            { age: 8, height: 74.8 },
            { age: 10, height: 77.5 },
            { age: 12, height: 79.8 },
            { age: 24, height: 91.7 },
            { age: 36, height: 100.6 },
            { age: 48, height: 108.0 },
            { age: 60, height: 115.7 },
        ],
    };
    // Select reference data based on gender
    const referenceData = gender.toLowerCase() === "male" ? heightReferenceBoy : heightReferenceGirl;
    // Find the closest age index in the reference data
    const closestAgeIndex = referenceData.normal.findIndex((data) => data.age >= ageInMonths);
    // If child's age is beyond the reference data, return Unknown
    if (closestAgeIndex === -1)
        return "Unknown";
    // If child's age is between two reference points, use linear interpolation
    let severelyStuntedThreshold, stuntedThreshold, tallThreshold;
    // Get the exact or next higher age reference point
    const exactMatchAge = referenceData.normal[closestAgeIndex].age === ageInMonths;
    if (exactMatchAge || closestAgeIndex === 0) {
        // If exact age match or it's the first entry, use direct values
        severelyStuntedThreshold =
            referenceData.severelyStunted[closestAgeIndex].height;
        stuntedThreshold = referenceData.stunted[closestAgeIndex].height;
        tallThreshold = referenceData.tall[closestAgeIndex].height;
    }
    else {
        // Use linear interpolation between the two closest age points
        const lowerIndex = closestAgeIndex - 1;
        const upperIndex = closestAgeIndex;
        const lowerAge = referenceData.normal[lowerIndex].age;
        const upperAge = referenceData.normal[upperIndex].age;
        // Calculate position between lower and upper age (0-1)
        const ageRatio = (ageInMonths - lowerAge) / (upperAge - lowerAge);
        // Interpolate thresholds
        severelyStuntedThreshold = interpolateHeight(referenceData.severelyStunted[lowerIndex].height, referenceData.severelyStunted[upperIndex].height, ageRatio);
        stuntedThreshold = interpolateHeight(referenceData.stunted[lowerIndex].height, referenceData.stunted[upperIndex].height, ageRatio);
        tallThreshold = interpolateHeight(referenceData.tall[lowerIndex].height, referenceData.tall[upperIndex].height, ageRatio);
    }
    // Determine status based on height thresholds
    if (heightInCm < severelyStuntedThreshold)
        return "Severely Stunted";
    if (heightInCm < stuntedThreshold)
        return "Stunted";
    if (heightInCm > tallThreshold)
        return "Tall";
    return "Normal";
}
function interpolateHeight(height1, height2, ratio) {
    return height1 + (height2 - height1) * ratio;
}
// Fungsi untuk menghitung status berat badan menurut tinggi (weight-for-height)
function calculateWeightForHeightStatus(heightInCm, weightInKg, gender) {
    // Reference data for weight-for-height (simplified)
    const weightForHeightBoy = {
        // Data format: {height: heightInCm, severelyWasted: kg, wasted: kg, normal: kg, overweight: kg}
        data: [
            {
                height: 45,
                severelyWasted: 1.9,
                wasted: 2.0,
                normal: 2.4,
                overweight: 3.1,
            },
            {
                height: 50,
                severelyWasted: 2.3,
                wasted: 2.5,
                normal: 3.1,
                overweight: 3.7,
            },
            {
                height: 55,
                severelyWasted: 2.9,
                wasted: 3.2,
                normal: 3.9,
                overweight: 4.8,
            },
            {
                height: 60,
                severelyWasted: 3.6,
                wasted: 4.0,
                normal: 4.9,
                overweight: 6.2,
            },
            {
                height: 65,
                severelyWasted: 4.5,
                wasted: 4.9,
                normal: 6.1,
                overweight: 7.6,
            },
            {
                height: 70,
                severelyWasted: 5.3,
                wasted: 5.8,
                normal: 7.2,
                overweight: 9.0,
            },
            {
                height: 75,
                severelyWasted: 6.1,
                wasted: 6.6,
                normal: 8.2,
                overweight: 10.3,
            },
            {
                height: 80,
                severelyWasted: 6.8,
                wasted: 7.4,
                normal: 9.2,
                overweight: 11.5,
            },
            {
                height: 85,
                severelyWasted: 7.5,
                wasted: 8.1,
                normal: 10.2,
                overweight: 12.7,
            },
            {
                height: 90,
                severelyWasted: 8.1,
                wasted: 8.8,
                normal: 11.1,
                overweight: 14.0,
            },
            {
                height: 95,
                severelyWasted: 8.7,
                wasted: 9.5,
                normal: 12.1,
                overweight: 15.3,
            },
            {
                height: 100,
                severelyWasted: 9.4,
                wasted: 10.2,
                normal: 13.0,
                overweight: 16.5,
            },
            {
                height: 105,
                severelyWasted: 10.1,
                wasted: 11.0,
                normal: 14.1,
                overweight: 17.8,
            },
            {
                height: 110,
                severelyWasted: 10.9,
                wasted: 11.8,
                normal: 15.1,
                overweight: 19.1,
            },
            {
                height: 115,
                severelyWasted: 11.7,
                wasted: 12.7,
                normal: 16.3,
                overweight: 20.5,
            },
            {
                height: 120,
                severelyWasted: 12.6,
                wasted: 13.7,
                normal: 17.5,
                overweight: 22.0,
            },
        ],
    };
    const weightForHeightGirl = {
        data: [
            {
                height: 45,
                severelyWasted: 1.9,
                wasted: 2.1,
                normal: 2.5,
                overweight: 3.1,
            },
            {
                height: 50,
                severelyWasted: 2.3,
                wasted: 2.5,
                normal: 3.0,
                overweight: 3.7,
            },
            {
                height: 55,
                severelyWasted: 2.9,
                wasted: 3.1,
                normal: 3.8,
                overweight: 4.7,
            },
            {
                height: 60,
                severelyWasted: 3.5,
                wasted: 3.8,
                normal: 4.7,
                overweight: 6.0,
            },
            {
                height: 65,
                severelyWasted: 4.2,
                wasted: 4.6,
                normal: 5.7,
                overweight: 7.1,
            },
            {
                height: 70,
                severelyWasted: 5.0,
                wasted: 5.4,
                normal: 6.7,
                overweight: 8.3,
            },
            {
                height: 75,
                severelyWasted: 5.7,
                wasted: 6.2,
                normal: 7.7,
                overweight: 9.5,
            },
            {
                height: 80,
                severelyWasted: 6.4,
                wasted: 7.0,
                normal: 8.7,
                overweight: 10.7,
            },
            {
                height: 85,
                severelyWasted: 7.1,
                wasted: 7.7,
                normal: 9.6,
                overweight: 11.8,
            },
            {
                height: 90,
                severelyWasted: 7.8,
                wasted: 8.4,
                normal: 10.5,
                overweight: 13.0,
            },
            {
                height: 95,
                severelyWasted: 8.5,
                wasted: 9.2,
                normal: 11.5,
                overweight: 14.3,
            },
            {
                height: 100,
                severelyWasted: 9.2,
                wasted: 9.9,
                normal: 12.5,
                overweight: 15.7,
            },
            {
                height: 105,
                severelyWasted: 10.0,
                wasted: 10.8,
                normal: 13.6,
                overweight: 17.2,
            },
            {
                height: 110,
                severelyWasted: 10.8,
                wasted: 11.7,
                normal: 14.7,
                overweight: 18.8,
            },
            {
                height: 115,
                severelyWasted: 11.7,
                wasted: 12.7,
                normal: 15.9,
                overweight: 20.5,
            },
            {
                height: 120,
                severelyWasted: 12.7,
                wasted: 13.8,
                normal: 17.2,
                overweight: 22.3,
            },
        ],
    };
    // Select reference data based on gender
    const referenceData = gender.toLowerCase() === "male" ? weightForHeightBoy : weightForHeightGirl;
    // Find the closest height index in the reference data
    let closestHeightIndex = -1;
    for (let i = 0; i < referenceData.data.length; i++) {
        if (referenceData.data[i].height >= heightInCm) {
            closestHeightIndex = i;
            break;
        }
    }
    // If height is beyond the reference data, return Unknown
    if (closestHeightIndex === -1)
        return "Unknown";
    // If height is between two reference points, use linear interpolation
    let severelyWastedThreshold, wastedThreshold, overweightThreshold;
    // Get the exact or next higher height reference point
    const exactMatchHeight = referenceData.data[closestHeightIndex].height === heightInCm;
    if (exactMatchHeight || closestHeightIndex === 0) {
        // If exact height match or it's the first entry, use direct values
        severelyWastedThreshold =
            referenceData.data[closestHeightIndex].severelyWasted;
        wastedThreshold = referenceData.data[closestHeightIndex].wasted;
        overweightThreshold = referenceData.data[closestHeightIndex].overweight;
    }
    else {
        // Use linear interpolation between the two closest height points
        const lowerIndex = closestHeightIndex - 1;
        const upperIndex = closestHeightIndex;
        const lowerHeight = referenceData.data[lowerIndex].height;
        const upperHeight = referenceData.data[upperIndex].height;
        // Calculate position between lower and upper height (0-1)
        const heightRatio = (heightInCm - lowerHeight) / (upperHeight - lowerHeight);
        // Interpolate thresholds
        severelyWastedThreshold = interpolateWeight(referenceData.data[lowerIndex].severelyWasted, referenceData.data[upperIndex].severelyWasted, heightRatio);
        wastedThreshold = interpolateWeight(referenceData.data[lowerIndex].wasted, referenceData.data[upperIndex].wasted, heightRatio);
        overweightThreshold = interpolateWeight(referenceData.data[lowerIndex].overweight, referenceData.data[upperIndex].overweight, heightRatio);
    }
    // Determine status based on weight thresholds
    if (weightInKg < severelyWastedThreshold)
        return "Severely Wasted";
    if (weightInKg < wastedThreshold)
        return "Wasted";
    if (weightInKg > overweightThreshold)
        return "Overweight";
    return "Normal";
}
// Fungsi untuk menghitung status BMI-untuk-umur
function calculateBMIForAgeStatus(ageInMonths, bmi, gender) {
    // Referensi data BMI-untuk-umur (simplified)
    const bmiReferenceData = {
        boys: [
            // Data format: {age: ageInMonths, severelyUnderweight: bmi, underweight: bmi, normal: bmi, overweight: bmi, obese: bmi}
            {
                age: 0,
                severelyUnderweight: 10.2,
                underweight: 11.1,
                normal: 13.4,
                overweight: 16.3,
                obese: 18.1,
            },
            {
                age: 12,
                severelyUnderweight: 13.4,
                underweight: 14.1,
                normal: 16.0,
                overweight: 18.0,
                obese: 19.4,
            },
            {
                age: 24,
                severelyUnderweight: 12.8,
                underweight: 13.7,
                normal: 15.4,
                overweight: 17.1,
                obese: 18.2,
            },
            {
                age: 36,
                severelyUnderweight: 12.3,
                underweight: 13.3,
                normal: 15.0,
                overweight: 16.8,
                obese: 17.7,
            },
            {
                age: 48,
                severelyUnderweight: 12.0,
                underweight: 13.0,
                normal: 14.7,
                overweight: 16.5,
                obese: 17.4,
            },
            {
                age: 60,
                severelyUnderweight: 11.8,
                underweight: 12.7,
                normal: 14.5,
                overweight: 16.5,
                obese: 17.9,
            },
        ],
        girls: [
            {
                age: 0,
                severelyUnderweight: 10.1,
                underweight: 11.0,
                normal: 13.3,
                overweight: 16.1,
                obese: 17.7,
            },
            {
                age: 12,
                severelyUnderweight: 13.0,
                underweight: 13.9,
                normal: 15.7,
                overweight: 17.4,
                obese: 18.9,
            },
            {
                age: 24,
                severelyUnderweight: 12.4,
                underweight: 13.4,
                normal: 15.1,
                overweight: 16.8,
                obese: 18.1,
            },
            {
                age: 36,
                severelyUnderweight: 12.0,
                underweight: 13.0,
                normal: 14.7,
                overweight: 16.5,
                obese: 17.8,
            },
            {
                age: 48,
                severelyUnderweight: 11.7,
                underweight: 12.7,
                normal: 14.4,
                overweight: 16.4,
                obese: 18.0,
            },
            {
                age: 60,
                severelyUnderweight: 11.5,
                underweight: 12.5,
                normal: 14.2,
                overweight: 16.5,
                obese: 18.3,
            },
        ],
    };
    const genderData = gender.toLowerCase() === "male"
        ? bmiReferenceData.boys
        : bmiReferenceData.girls;
    // Find the closest age index in the BMI reference data
    let closestAgeIndex = -1;
    for (let i = 0; i < genderData.length; i++) {
        if (genderData[i].age >= ageInMonths) {
            closestAgeIndex = i;
            break;
        }
    }
    // If age is beyond the reference data, return Unknown
    if (closestAgeIndex === -1)
        return "Unknown";
    // If age is between two reference points, use linear interpolation
    let severelyUnderweightThreshold, underweightThreshold, overweightThreshold, obeseThreshold;
    // Get the exact or next higher age reference point
    const exactMatchAge = genderData[closestAgeIndex].age === ageInMonths;
    if (exactMatchAge || closestAgeIndex === 0) {
        // If exact age match or it's the first entry, use direct values
        severelyUnderweightThreshold =
            genderData[closestAgeIndex].severelyUnderweight;
        underweightThreshold = genderData[closestAgeIndex].underweight;
        overweightThreshold = genderData[closestAgeIndex].overweight;
        obeseThreshold = genderData[closestAgeIndex].obese;
    }
    else {
        // Use linear interpolation between the two closest age points
        const lowerIndex = closestAgeIndex - 1;
        const upperIndex = closestAgeIndex;
        const lowerAge = genderData[lowerIndex].age;
        const upperAge = genderData[upperIndex].age;
        // Calculate position between lower and upper age (0-1)
        const ageRatio = (ageInMonths - lowerAge) / (upperAge - lowerAge);
        // Interpolate thresholds
        severelyUnderweightThreshold = interpolateWeight(genderData[lowerIndex].severelyUnderweight, genderData[upperIndex].severelyUnderweight, ageRatio);
        underweightThreshold = interpolateWeight(genderData[lowerIndex].underweight, genderData[upperIndex].underweight, ageRatio);
        overweightThreshold = interpolateWeight(genderData[lowerIndex].overweight, genderData[upperIndex].overweight, ageRatio);
        obeseThreshold = interpolateWeight(genderData[lowerIndex].obese, genderData[upperIndex].obese, ageRatio);
    }
    // Determine status based on BMI thresholds
    if (bmi < severelyUnderweightThreshold)
        return "Severely Underweight";
    if (bmi < underweightThreshold)
        return "Underweight";
    if (bmi > obeseThreshold)
        return "Obese";
    if (bmi > overweightThreshold)
        return "Overweight";
    return "Normal";
}
