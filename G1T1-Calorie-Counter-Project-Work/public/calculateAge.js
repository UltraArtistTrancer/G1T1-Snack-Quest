const birthdateField = document.getElementById('birthdate');
const currentAge=document.getElementById('currentAge');
const updateForm=document.getElementById('updateForm');

updateForm.addEventListener('submit', () => {
    const birthdate = new Date(birthdateField.value);
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        age--;
    }

    currentAge.value=age;
});