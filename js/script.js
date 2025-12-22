// Typing Animation
var typed = new Typed(".typing", {
    strings: ["", "Web Developer", "ServiceNow Developer", "SEO Specialist", "WordPress Developer"],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true
});

// Navigation and Section Handling
const nav = document.querySelector(".nav"), // First declaration of 'nav'
      navList = nav.querySelectorAll("li"),
      totalNavList = navList.length,
      allSection = document.querySelectorAll(".section"),
      totalSection = allSection.length;

// Event listener for navigation links
navList.forEach(navItem => {
    const link = navItem.querySelector("a");

    link.addEventListener("click", () => {
        removeBackSection();

        navList.forEach(item => {
            item.querySelector("a").classList.remove("active");
        });

        // Get currently active section BEFORE switching
        const activeSection = document.querySelector(".section.active");
        addBackSection(activeSection);

        link.classList.add("active");
        showSection(link);

        if (window.innerWidth < 1200) {
            asideSectionTogglerBtn();
        }
    });
});


// Remove the 'back-section' class from all sections
function removeBackSection() {
    allSection.forEach(section => section.classList.remove("back-section"));
}

// Add the 'back-section' class to a specific section
function addBackSection(targetSection) {
    if (!targetSection) return;
    targetSection.classList.add("back-section");
}

// Show the corresponding section based on the clicked link
function showSection(element) {
    allSection.forEach(section => section.classList.remove("active"));
    const target = element.getAttribute("href").split("#")[1];
    document.querySelector("#" + target).classList.add("active");
}

// Update the navigation to reflect the current section
function updateNav(element) {
    navList.forEach(navItem => {
        const link = navItem.querySelector("a");
        link.classList.remove("active");
        const target = element.getAttribute("href").split("#")[1];
        if (target === link.getAttribute("href").split("#")[1]) {
            link.classList.add("active");
        }
    });
}

// Event listener for 'Hire Me' button
document.querySelector(".hire-me").addEventListener("click", function () {
    const sectionIndex = this.getAttribute("data-section-index");
    showSection(this);
    updateNav(this);
    removeBackSection();
    addBackSection(sectionIndex);
});

// Toggle the aside section
const navTogglerBtn = document.querySelector(".nav-toggler"),
      aside = document.querySelector(".aside");

navTogglerBtn.addEventListener("click", asideSectionTogglerBtn);

function asideSectionTogglerBtn() {
    aside.classList.toggle("open");
    navTogglerBtn.classList.toggle("open");
    allSection.forEach(section => section.classList.toggle("open"));
}

//CV //
document.getElementById('download-cv').addEventListener('click', function(event) {
    event.preventDefault();
    var url = this.href;
    var newTab = window.open(url, '_blank');
    setTimeout(function() {
        var a = document.createElement('a');
        a.href = url;
        a.download = 'Raja_Aqib_CV.pdf';
        newTab.document.body.appendChild(a);
        a.click();
        newTab.document.body.removeChild(a);
    }, 1000); // Adjust the delay as needed
});

//Email function
document.addEventListener('DOMContentLoaded', (event) => {
    emailjs.init('QiAf_PYbwrtcvLScS'); // Replace YOUR_USER_ID with your actual User ID

    document.querySelector('.contact-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        sendMail();
    });
});

function sendMail() {
    var params = {
        from_name: document.getElementById("name").value,
        from_email: document.getElementById("email").value,
        subject: document.getElementById("subject").value,
        message: document.getElementById("message").value
    };

    const serviceID = "service_xwsfugw"; // Replace YOUR_SERVICE_ID with your actual Service ID
    const templateID = "template_52pv6ib"; // Replace YOUR_TEMPLATE_ID with your actual Template ID

    emailjs.send(serviceID, templateID, params)
        .then((res) => {
            console.log(res);
            alert("Your message was sent successfully!");
            document.getElementById("name").value = "";
            document.getElementById("email").value = "";
            document.getElementById("subject").value = "";
            document.getElementById("message").value = "";
        })
        .catch((err) => console.error("Failed to send email. Error: ", err));
}

