# QuizzyStudio


# Quizzy - Interactive Quiz Application

Quizzy is a web-based application designed for creating, managing, and playing interactive quizzes. It allows users to build custom quizzes with various question types, including text and images, and provides a platform to test their knowledge. Quizzy stores all data locally in the user's browser using IndexedDB, ensuring offline accessibility for created quizzes.

## Current Features (Version 1.5.0)

### Quiz Creation & Editing:
*   **Create New Quizzes:** Start by giving your quiz a title.
*   **Add Diverse Questions:**
    *   **Open-Ended:** Questions requiring a typed response.
    *   **Multiple-Choice:** Define several options and mark one or more as correct.
    *   **True/False:** Simple true or false questions.
*   **Image Support:** Attach images (JPEG, PNG, GIF, SVG) to questions. Includes an image preview and a removal option. Images are automatically resized for optimization.
*   **Explanations:** Provide explanations for answers, which are shown after a question is attempted or during results review.
*   **Dynamic Question List:** See a list of questions already added to the current quiz during the creation process.
*   **Edit Existing Quizzes:** Modify any aspect of previously created quizzes, including title, questions, answers, and images.

### Quiz Management:
*   **View All Quizzes:** A central list displays all saved quizzes, showing title, ID, number of questions, and creation date.
*   **Data Persistence:** Quizzes are saved locally in the browser's IndexedDB, allowing users to access their quizzes even when offline.
*   **Import/Export:**
    *   **Export Single Quiz:** Download an individual quiz as a JSON file.
    *   **Export All Quizzes:** Download all quizzes in a single JSON file for backup or sharing.
    *   **Import Quizzes:** Upload quizzes from a JSON file (supports single quiz objects or an array of quizzes).
*   **Delete Quizzes:** Remove unwanted quizzes (with a confirmation prompt).
*   **Sample Quiz:** A "Quiz d'introduction à la Cybersécurité" (Cybersecurity Introduction Quiz) is automatically added on first load if no other quizzes exist, providing an immediate example.

### Quiz Playing:
*   **Interactive Play Mode:** Launch any quiz from your list.
*   **Question Navigation:** Move forwards and backwards through questions.
*   **Answering:**
    *   Select options for Multiple-Choice and True/False questions.
    *   Type answers for Open-Ended questions.
*   **View Correction:** After attempting a question (for MCQs and T/F), users can see the correct answer and any provided explanation.
*   **Results Summary:**
    *   Displays the user's score (correct answers out of scorable questions; open-ended questions are not auto-graded).
    *   Provides a detailed review of each question, showing the user's answer, the correct answer, and explanations.
*   **Replay:** Option to retake a quiz.
*   **Celebration Animations:**
    *   Fun, small animations for achieving a good score (e.g., 80% and above).
    *   Full-screen confetti animation for achieving a perfect score on quizzes with scorable questions.

### User Interface & Experience:
*   **Responsive Design:** Adapts to different screen sizes, ensuring usability on desktop and mobile devices.
*   **Intuitive Navigation:** Clear navigation bar (Home, Create, View, Stats).
*   **Toast Notifications:** Non-intrusive feedback messages for actions like saving, errors, or successful operations.
*   **Visual Appeal:** Modern design with gradients, shadows, and clear typography.
*   **Action Icons:** Uses icons for common actions like export, import, edit, play, and delete, enhancing visual understanding.

## Technology Stack
*   **Frontend:** HTML5, CSS3, JavaScript (ES6+)
*   **Local Storage:** IndexedDB for client-side database storage.
*   **Fonts:** Google Fonts (Roboto).
*   **Icons:** Sourced from Icons8 (as per image URLs in the code).

## How to Use
1.  Open `index.html` in a modern web browser.
2.  Navigate using the top menu:
    *   **Accueil (Home):** Welcome page.
    *   **Créer un Quiz (Create Quiz):** Start building a new quiz or edit an existing one.
    *   **Voir les Quiz (View Quizzes):** List, play, manage, import/export your quizzes.
    *   **Statistiques (Stats):** (Placeholder for future feature).
3.  Your quizzes are automatically saved in your browser.

## Future Enhancements & Roadmap

Quizzy aims to continuously improve and add more engaging features. Here are some ideas for future versions:

### Core Functionality Improvements:
*   **Enhanced Stats Page:**
    *   Track user performance (average scores, scores over time).
    *   Identify most frequently missed/correctly answered questions.
    *   Time taken per quiz/question.
*   **Advanced Question Types:**
    *   Fill-in-the-blanks.
    *   Matching pairs.
    *   Sequencing/ordering questions.
*   **Quiz Settings & Customization:**
    *   Option to set time limits per quiz or per question.
    *   Ability to randomize question order.
    *   Randomize answer order for multiple-choice questions.
*   **Search and Filtering:**
    *   Search for quizzes by title or keywords within questions.
    *   Filter quizzes by category or tags (would require adding tagging functionality).

### User Experience & AI Integration:
*   **AI-Powered Question Generation (Gemini API):**
    *   Generate quiz questions based on a user-provided topic or text.
    *   Suggest plausible distractors for multiple-choice questions.
    *   Offer automated feedback or hints for open-ended questions.
*   **Improved Image Management:**
    *   A dedicated media library for uploaded images.
    *   Basic image editing tools (crop, rotate).
*   **Enhanced Accessibility (A11y):**
    *   Rigorous review and implementation of ARIA attributes.
    *   Full keyboard navigation testing and improvements.
*   **Theming & Personalization:**
    *   Allow users to choose different color themes or customize the app's appearance.
*   **Internationalization (i18n):**
    *   Support for multiple languages in the UI and for quiz content.

### Collaboration & Sharing (Larger Scope):
*   **User Accounts:**
    *   Allow users to create accounts to sync quizzes across devices (would require a backend).
*   **Quiz Sharing:**
    *   Share quizzes with other users via links or codes.
*   **Collaborative Quiz Building:**
    *   Allow multiple users to contribute to the creation of a single quiz.

### Other Potential Features:
*   **Printable Quizzes:** Option to generate a printer-friendly version of quizzes.
*   **Gamification:** Introduce badges, points, or leaderboards to make learning more engaging.
*   **Progress Tracking for "Courses":** Group quizzes into larger learning modules.

This roadmap is subject to change based on user feedback and development priorities. We are excited about the future of Quizzy and welcome any suggestions!
