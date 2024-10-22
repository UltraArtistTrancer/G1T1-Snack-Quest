async function fetchNutritionData() {
    return new Promise((resolve, reject) => {
        const sex = document.getElementById('sex').value;
        const age = document.getElementById('currentAge').value;
        const height = document.getElementById('height').value;
        const weight = document.getElementById('weight').value;
        const activity = document.getElementById('lifestyle').value;

        const apiUrl = 'https://nutrition-calculator.p.rapidapi.com/api/nutrition-info';

        axios.get(apiUrl, { 
            headers: {
                'x-rapidapi-key': '4b229f2d4bmshf0f87c82f3c0affp14a380jsn22f455c302c3',
                'x-rapidapi-host': 'nutrition-calculator.p.rapidapi.com'
            },
            params: {
                measurement_units: 'met', // fixed (intent of app is local purpose)
                sex: sex,
                age_value: age,
                age_type: 'yrs', // fixed (months not needed)
                cm: height,
                kilos: weight,
                activity_level: activity
            }
        })
        .then(response => {
            const data = response.data;
            const bmi = data.BMI_EER ? data.BMI_EER.BMI : "N/A";
            const calorie_needs = data.BMI_EER ? data.BMI_EER["Estimated Daily Caloric Needs"] : "N/A";
            const macronutrients = data.macronutrients_table ? data.macronutrients_table["macronutrients-table"] : [];

            const macronutrient_dict = {};
            macronutrients.forEach(item => {
                macronutrient_dict[item[0]] = item[1];
            });

            const carbohydrates = macronutrient_dict["Carbohydrate"] || "N/A";
            const protein = macronutrient_dict["Protein"] || "N/A";
            const fat = macronutrient_dict["Fat"] || "N/A";
            const fiber = macronutrient_dict["Total Fiber"] || "N/A";

            document.getElementById('carbohydrates').value = carbohydrates;
            document.getElementById('protein').value = protein;
            document.getElementById('fat').value = fat;
            document.getElementById('fiber').value = fiber;
            document.getElementById('bmi').value = bmi;
            document.getElementById('calorieNeeds').value = calorie_needs;

            resolve(); // Resolve the promise when done
        })
        .catch(error => {
            document.getElementById('result').innerHTML = `<p>Error: ${error.message}</p>`;
            reject(error); // Reject the promise in case of error
        });
    });
}

// Add this to your form submission code
document.getElementById('registrationForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Call fetchNutritionData and wait for it to complete
    await fetchNutritionData(); // This will wait for the nutrition data to be populated

    // Now you can safely gather user input and submit to Firestore
});
