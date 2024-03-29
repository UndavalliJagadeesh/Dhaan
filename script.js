document.addEventListener("DOMContentLoaded", function() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 70,
                    behavior: 'smooth'
                });
            }

            navLinks.forEach(otherLink => otherLink.classList.remove('active'));
            this.classList.add('active');
        });
    });
});




document.addEventListener("DOMContentLoaded", function() {
    // API base URL
    const apiUrl = 'https://dhaanapi.onrender.com/api';

    // Function to fetch data from API
    async function fetchData(endpoint) {
        try {
            const response = await fetch(apiUrl + endpoint);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    // Function to update stats in the "Stats" division
    async function updateStats() {
        try {
            // Fetch data for various endpoints
            const [users, beneficiaries, donors, remainingUnits, totalDonated] = await Promise.all([
                fetchData('/no_of_users'),
                fetchData('/no_of_beneficiaries'),
                fetchData('/no_of_donors'),
                fetchData('/remaining_units'),
                fetchData('/total_donated')
            ]);

            // Update total users, donations, beneficiaries, and donors with fade-in effect
            updateNumberWithFadeIn('totalUsers', users.registered_users, "Users Registered");
            updateNumberWithFadeIn('totalBeneficiaries', beneficiaries.beneficiaries, "Total Benificiaries");
            updateNumberWithFadeIn('totalDonors', donors.donors, "Total Donors");
            updateNumberWithFadeIn('remainingUnits', remainingUnits.available_units/1000, "Remaining Units (in L)");
            updateNumberWithFadeIn('totalDonation', parseFloat(totalDonated.donated_units/1000).toFixed(2), "Total Donated Units (in L)");


            // Fetch data for user registrations per month
            const registrationsPerMonth = await fetchData('/registrations_per_month');
            const registrationsLabels = registrationsPerMonth.map(data => `${data.month}/${data.year}`);
            const registrationsData = registrationsPerMonth.map(data => data.total_registrations);

            // Fetch data for transactions per month
            const transactionsPerMonth = await fetchData('/transactions_per_month');
            const transactionsLabels = transactionsPerMonth.map(data => `${data.month}/${data.year}`);
            const transactionsData = transactionsPerMonth.map(data => data.total_transactions);

            // Create a chart for user registrations per month
            const registrationsCtx = document.getElementById('userRegistrationsChart').getContext('2d');
            new Chart(registrationsCtx, {
                type: 'line',
                data: {
                    labels: registrationsLabels,
                    datasets: [{
                        label: 'User Registrations each month',
                        data: registrationsData,
                        fill: false,
                        borderColor: 'rgb(192, 75, 75)',
                        tension: 0.1
                    }]
                }
            });

            // Create a chart for transactions per month
            const transactionsCtx = document.getElementById('transactionsPerMonthChart').getContext('2d');
            new Chart(transactionsCtx, {
                type: 'bar',
                data: {
                    labels: transactionsLabels,
                    datasets: [{
                        label: 'Transactions each month',
                        data: transactionsData,
                        fill: false,
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.1
                    }]
                }
            });
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    // Function to update number with fade-in effect
    // Function to update number with fade-in effect and description
    function updateNumberWithFadeIn(elementId, value, description) {
        const element = document.getElementById(elementId);
        const increment = Math.ceil(value / 100); // Divide the value into 100 parts for smooth transition
        let current = 0;

        function update() {
            if (current <= value) {
                element.innerText = current;
                current += increment;
                requestAnimationFrame(update);
            } else {
                element.innerText = value;
                const descriptionElement = document.createElement('p');
                descriptionElement.innerText = description;
                element.parentNode.appendChild(descriptionElement);
                element.classList.add('fade-in');
            }
        }

        update();
    }


    // Update stats when the page loads
    updateStats();
});