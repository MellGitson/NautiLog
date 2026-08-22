# Personal Introduction & Project Overview (English)

**Projet :** NautiLog, gestion de flotte nautique et carte interactive de disponibilité
**Titre visé :** Concepteur Développeur d'Applications (CDA)
**Auteur :** Mell Canac
**IPSSI :** 

---

## Sommaire

1. Personal introduction
2. Project overview

---

## 1. Personal introduction

*(Section à compléter par moi, parcours et motivations personnelles. Rédiger directement en anglais, quelques phrases courtes suffisent pour une introduction orale.)*

**Background / parcours :**
Before starting this program, I spent over ten years competing in rugby at a high level, including winning a French championship title. Following a serious injury and subsequent surgery, I had to step back and rethink my path. That period pushed me to focus on building a real, qualified vocation for the long term, something I could commit to and grow in. Encouraged by my family and a close friend already working in IT, I started looking into the field and found myself genuinely drawn to it.

**Why I chose the CDA program / motivations :**
I looked for a training path that was both structured and recognized, one that would let me gain a diploma equivalent to what graduate schools deliver, build real experience, and open concrete career opportunities in tech. That search led me to enroll in a master's-level program, with the CDA certification as the first major milestone.

**Why this project (NautiLog) / pourquoi ce sujet :**
I chose fleet and marina management as my subject because it gave me a technically rich problem to solve (real-time availability tracking, an interactive map, role-based access control, secure handling of sensitive data), independent of the nautical theme itself. It let me demonstrate the full breadth of what the CDA certification covers, end to end, on a single coherent product.

---

## 2. Project overview

Good morning / afternoon. My name is Mell Canac, and today I'm presenting NautiLog, a fleet management application I developed as my final project for the Concepteur Développeur d'Applications certification.

**The problem.** Boat rental companies and marina operators often manage their fleet with scattered tools (spreadsheets, phone calls, emails) to track which boats are available, where they're moored, their maintenance history, and ongoing bookings. NautiLog brings all of this together in a single, secure web platform.

**What it does.** The application covers three main areas. First, fleet management: owners can register boats, track their status (available, rented, or under repair), and log repair history. Second, port and berth management: an interactive map, built with Leaflet, shows marinas and their individual mooring spots, with live marine weather data pulled from a public API. Third, a booking system with automatic conflict detection, so two renters can never book the same boat on overlapping dates.

**Who uses it.** Three roles are supported: administrators, who have full oversight of the fleet and can arbitrate berth requests and disputes; owners, who manage their own boats; and renters, who search for and book available boats.

**How it's built.** NautiLog follows a fully decoupled, API-first architecture: a Symfony 8 REST API on the backend, a React single-page application on the frontend, both containerized with Docker and served behind an Nginx reverse proxy, with PostgreSQL as the database. Authentication is stateless, based on signed JWT tokens, and access control is enforced at two levels: globally through Symfony's security configuration, and finely through a dedicated Voter that checks resource ownership.

**Security and compliance** were treated as first-class concerns rather than an afterthought. Sensitive data such as boat license numbers are encrypted at rest, and the application fully implements the right to erasure under GDPR, with a cascading deletion process that notifies affected users before removing their data.

**Quality and delivery.** The project includes an automated test suite, and a GitHub Actions pipeline that runs linting, tests, a vulnerability scan, and builds Docker images on every push, so that code quality is verified continuously rather than checked manually at the end.

This project let me apply, end to end, the three competency blocks of the CDA certification: building a secure application, designing a properly layered architecture, and preparing an application for deployment through a real CI/CD pipeline, all as a solo developer over a ten-week timeframe.

---

## Note pour la suite

La présentation détaillée du projet **en français** (contexte et problématique, solution développée, technologies utilisées, point II de la checklist) fait l'objet d'un document séparé, à rédiger ensuite.
