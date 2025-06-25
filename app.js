// app.js - Quizzy v1.5.0

const appContainer = document.getElementById('app');
const navLinks = document.querySelectorAll('.navigation a');
const toastContainer = document.getElementById('toastContainer');

let currentCreatingQuiz = null; 
let currentPlayingQuiz = null;
let currentPlayQuestionIndex = 0;
let userPlayAnswers = [];
let answerRevealedForQuestion = []; 
let currentQuestionImageBase64 = null; // For image upload

const GOOD_SCORE_THRESHOLD_PERCENT = 80; // 80% pour un "bon score"
const MAX_IMAGE_WIDTH = 800; // Max width for image resize
const MAX_IMAGE_HEIGHT = 800; // Max height for image resize


// --- Toast Notification System ---
function showToast(message, type = 'info', duration = 4000) {
  if (!toastContainer) {
    console.error("Toast container not found!");
    alert(message); 
    return;
  }

  const toast = document.createElement('div');
  toast.classList.add('toast', `toast-${type}`);
  
  const messageSpan = document.createElement('span');
  messageSpan.classList.add('toast-message');
  messageSpan.textContent = message;
  toast.appendChild(messageSpan);

  const closeButton = document.createElement('button');
  closeButton.classList.add('toast-close-button');
  closeButton.innerHTML = '&times;';
  closeButton.onclick = () => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode === toastContainer) {
         toastContainer.removeChild(toast);
      }
    }, 400); 
  };
  toast.appendChild(closeButton);

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10); 

  setTimeout(() => {
    if (toast.classList.contains('show') && toast.parentNode === toastContainer) {
      closeButton.click(); 
    }
  }, duration);
}

// --- Image Handling ---
async function handleImageUpload(event) {
    const file = event.target.files[0];
    const imagePreview = document.getElementById('imagePreview');
    const removeImageButton = document.getElementById('removeImageButton');

    if (!file) {
        handleRemoveImage(); 
        return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'].includes(file.type)) {
        showToast('Type de fichier non supporté. Veuillez choisir une image (JPEG, PNG, GIF, SVG).', 'warning');
        handleRemoveImage();
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('L\'image est trop volumineuse (max 5MB).', 'warning');
        handleRemoveImage();
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataURL = e.target.result;

        if (file.type === 'image/svg+xml') {
            currentQuestionImageBase64 = dataURL;
            if (imagePreview) imagePreview.src = dataURL;
            if (removeImageButton) removeImageButton.style.display = 'inline-block';
            if (imagePreview) imagePreview.style.display = 'block';
        } else { 
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                let quality = 0.8;

                if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
                    if (width > height) {
                        if (width > MAX_IMAGE_WIDTH) {
                            height = Math.round(height * (MAX_IMAGE_WIDTH / width));
                            width = MAX_IMAGE_WIDTH;
                        }
                    } else {
                        if (height > MAX_IMAGE_HEIGHT) {
                            width = Math.round(width * (MAX_IMAGE_HEIGHT / height));
                            height = MAX_IMAGE_HEIGHT;
                        }
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                try {
                    currentQuestionImageBase64 = canvas.toDataURL('image/jpeg', quality);
                } catch (error) {
                    console.warn("Erreur lors de la conversion en JPEG, tentative en PNG.", error);
                    currentQuestionImageBase64 = canvas.toDataURL('image/png');
                }

                if (imagePreview) imagePreview.src = currentQuestionImageBase64;
                if (removeImageButton) removeImageButton.style.display = 'inline-block';
                if (imagePreview) imagePreview.style.display = 'block';
            };
            img.onerror = () => {
                showToast("Erreur lors du chargement de l'image pour redimensionnement.", "error");
                handleRemoveImage();
            };
            img.src = dataURL;
        }
    };
    reader.onerror = () => {
        showToast("Erreur de lecture du fichier image.", "error");
        handleRemoveImage();
    };
    reader.readAsDataURL(file);
}

function handleRemoveImage() {
    currentQuestionImageBase64 = null;
    const imageInput = document.getElementById('questionImage');
    if (imageInput) imageInput.value = ''; 
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.src = '';
        imagePreview.style.display = 'none';
    }
    const removeImageButton = document.getElementById('removeImageButton');
    if (removeImageButton) removeImageButton.style.display = 'none';
}


function renderQuestionTypeSpecificFields(type = 'open-ended') {
  const container = document.getElementById('questionTypeSpecificFields');
  if (!container) return;

  let fieldsHTML = '';
  switch (type) {
    case 'multiple-choice':
      fieldsHTML = `
        <label>Options de réponse :</label>
        <div id="mcOptionsContainer">
          <div class="mc-option">
            <input type="text" name="mcOptionText[]" placeholder="Texte de l'option 1" class="mc-option-text" required>
            <label class="mc-correct-label"><input type="checkbox" name="mcOptionCorrect[]" class="mc-option-correct"> Correcte</label>
            <button type="button" class="remove-mc-option" style="display:none;">&times;</button>
          </div>
          <div class="mc-option">
            <input type="text" name="mcOptionText[]" placeholder="Texte de l'option 2" class="mc-option-text" required>
            <label class="mc-correct-label"><input type="checkbox" name="mcOptionCorrect[]" class="mc-option-correct"> Correcte</label>
            <button type="button" class="remove-mc-option" style="display:none;">&times;</button>
          </div>
        </div>
        <button type="button" id="addMcOptionButton">Ajouter une option</button>
      `;
      break;
    case 'true-false':
      fieldsHTML = `
        <div>
          <label for="tfCorrectAnswer">Réponse correcte :</label>
          <select id="tfCorrectAnswer" name="tfCorrectAnswer">
            <option value="true" selected>Vrai</option>
            <option value="false">Faux</option>
          </select>
        </div>
      `;
      break;
    case 'open-ended':
    default:
      fieldsHTML = '<p><em>Pour les réponses ouvertes, la réponse attendue peut être détaillée dans l\'explication.</em></p>';
      break;
  }
  container.innerHTML = fieldsHTML;

  if (type === 'multiple-choice') {
    document.getElementById('addMcOptionButton').addEventListener('click', addMcOption);
    updateRemoveOptionButtons();
  }
}

function addMcOption() {
  const optionsContainer = document.getElementById('mcOptionsContainer');
  if (!optionsContainer) return;
  const optionCount = optionsContainer.children.length;
  const newOption = document.createElement('div');
  newOption.classList.add('mc-option');
  newOption.innerHTML = `
    <input type="text" name="mcOptionText[]" placeholder="Texte de l'option ${optionCount + 1}" class="mc-option-text" required>
    <label class="mc-correct-label"><input type="checkbox" name="mcOptionCorrect[]" class="mc-option-correct"> Correcte</label>
    <button type="button" class="remove-mc-option">&times;</button>
  `;
  optionsContainer.appendChild(newOption);
  newOption.querySelector('.remove-mc-option').addEventListener('click', function() {
    this.parentElement.remove();
    updateRemoveOptionButtons();
  });
  updateRemoveOptionButtons();
}

function updateRemoveOptionButtons() {
    const optionsContainer = document.getElementById('mcOptionsContainer');
    if (!optionsContainer) return;
    const mcOptions = optionsContainer.querySelectorAll('.mc-option');
    const showRemove = mcOptions.length > 2;

    mcOptions.forEach((option, index) => {
        const removeBtn = option.querySelector('.remove-mc-option');
        if (removeBtn) {
            removeBtn.style.display = (index >= 2 && showRemove) ? 'inline-block' : 'none';
        }
    });
}

function triggerDownload(filename, content, mimeType = 'application/json') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// --- Export/Import Logic ---
async function handleExportQuiz(quizId) {
    try {
        const quiz = await getQuiz(Number(quizId));
        if (!quiz) {
            showToast("Quiz non trouvé pour l'export.", "error");
            return;
        }
        // Prepare quiz data for export (remove DB-specific fields)
        const quizToExport = { ...quiz };
        delete quizToExport.id;
        delete quizToExport.createdAt;
        // Questions ID (Date.now()) and imageDataURL are kept

        const jsonData = JSON.stringify(quizToExport, null, 2);
        const filename = `quiz_${quiz.title.replace(/\s+/g, '_') || 'export'}.json`;
        triggerDownload(filename, jsonData);
        showToast(`Quiz "${quiz.title}" exporté.`, "success");
    } catch (error) {
        console.error("Erreur lors de l'export du quiz:", error);
        showToast("Erreur d'exportation du quiz.", "error");
    }
}

async function handleExportAllQuizzes() {
    try {
        const quizzes = await getAllQuizzes();
        if (quizzes.length === 0) {
            showToast("Aucun quiz à exporter.", "info");
            return;
        }
        const quizzesToExport = quizzes.map(q => {
            const quizCopy = { ...q };
            delete quizCopy.id;
            delete quizCopy.createdAt;
            return quizCopy;
        });
        const jsonData = JSON.stringify(quizzesToExport, null, 2);
        const filename = `quizzy_all_quizzes_export_${new Date().toISOString().slice(0,10)}.json`;
        triggerDownload(filename, jsonData);
        showToast(`${quizzes.length} quiz exportés.`, "success");
    } catch (error) {
        console.error("Erreur lors de l'export de tous les quiz:", error);
        showToast("Erreur d'exportation de tous les quiz.", "error");
    }
}

function handleImportFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
        showToast("Veuillez sélectionner un fichier JSON.", "warning");
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            let quizzesToImport = [];

            if (Array.isArray(importedData)) {
                quizzesToImport = importedData;
            } else if (typeof importedData === 'object' && importedData !== null && importedData.title && importedData.questions) {
                quizzesToImport = [importedData];
            } else {
                showToast("Format JSON invalide. Le fichier doit contenir un quiz unique ou un tableau de quiz.", "error");
                return;
            }

            let importedCount = 0;
            let skippedCount = 0;

            for (const quizData of quizzesToImport) {
                if (typeof quizData.title !== 'string' || !Array.isArray(quizData.questions)) {
                    console.warn("Quiz ignoré (titre ou questions manquants/invalides) :", quizData);
                    skippedCount++;
                    continue;
                }
                
                // Validate questions
                const validQuestions = quizData.questions.filter(q => 
                    q && typeof q.text === 'string' && typeof q.type === 'string'
                ).map(q => ({ // Ensure essential fields for questions
                    id: q.id || Date.now() + Math.random(), // Assign new ID if missing
                    text: q.text,
                    type: q.type,
                    explanation: q.explanation || "",
                    options: q.options || (q.type === 'multiple-choice' ? [] : undefined),
                    correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : (q.type === 'true-false' ? true : undefined),
                    imageDataURL: q.imageDataURL || null
                }));

                if (validQuestions.length !== quizData.questions.length) {
                    console.warn(`Certaines questions du quiz "${quizData.title}" ont été ignorées en raison d'un format invalide.`);
                }
                
                if (validQuestions.length === 0 && quizData.questions.length > 0) {
                     console.warn(`Quiz "${quizData.title}" ignoré car toutes ses questions étaient invalides.`);
                     skippedCount++;
                     continue;
                }


                const quizToAdd = {
                    title: quizData.title,
                    questions: validQuestions,
                    // createdAt will be set by addQuiz if not present
                    // id will be set by DB
                };

                try {
                    await addQuiz(quizToAdd);
                    importedCount++;
                } catch (addError) {
                    console.error(`Erreur lors de l'ajout du quiz "${quizData.title}" :`, addError);
                    skippedCount++;
                }
            }

            if (importedCount > 0) {
                showToast(`${importedCount} quiz importé(s) avec succès !`, "success");
            }
            if (skippedCount > 0) {
                showToast(`${skippedCount} quiz n'a/ont pas pu être importé(s) (vérifiez la console pour les détails).`, "warning");
            }
            if (importedCount === 0 && skippedCount === 0 && quizzesToImport.length > 0) {
                 showToast("Aucun quiz valide trouvé dans le fichier.", "info");
            }
            if (importedCount > 0) {
                 renderContent(); // Refresh view if something was imported
            }

        } catch (parseError) {
            console.error("Erreur lors de l'analyse du fichier JSON:", parseError);
            showToast("Erreur lors de la lecture du fichier JSON. Est-il valide ?", "error");
        } finally {
            event.target.value = null; // Reset file input
        }
    };
    reader.onerror = () => {
        showToast("Erreur de lecture du fichier.", "error");
        event.target.value = null; // Reset file input
    };
    reader.readAsText(file);
}


const pages = {
  '#home': () => `
    <h2>Bienvenue sur Quizzy !</h2>
    <p>Votre plateforme pour créer, modifier et partager des quiz interactifs.</p>
    <p>Utilisez la navigation ci-dessus pour commencer à explorer les fonctionnalités ou cliquez sur le bouton ci-dessous pour créer votre premier quiz.</p>
    <button onclick="window.location.hash='#create'">Créer un Quiz</button>
  `,
  '#create': () => {
    if (currentCreatingQuiz) {
      return `
        <h2>Quiz : ${currentCreatingQuiz.title}</h2>
        <form id="addQuestionForm">
          <div>
            <label for="questionText">Texte de la question :</label>
            <textarea id="questionText" name="questionText" rows="3" required></textarea>
          </div>
          <div>
            <label for="questionImage">Image pour la question (optionnel) :</label>
            <input type="file" id="questionImage" name="questionImage" accept="image/png, image/jpeg, image/gif, image/svg+xml">
            <div class="image-preview-container">
                <img id="imagePreview" src="#" alt="Aperçu de l'image" style="display:none;">
            </div>
            <button type="button" id="removeImageButton" class="remove-image-button" style="display:none;">Retirer l'image</button>
          </div>
          <div>
            <label for="questionType">Type de question :</label>
            <select id="questionType" name="questionType">
              <option value="open-ended" selected>Réponse Ouverte</option>
              <option value="multiple-choice">Choix Multiple</option>
              <option value="true-false">Vrai/Faux</option>
            </select>
          </div>
          <div id="questionTypeSpecificFields" style="margin-top:10px; margin-bottom:10px; padding:10px; background-color:#f0f0f0; border-radius:5px;">
            <!-- Dynamic fields will be loaded here by renderQuestionTypeSpecificFields -->
          </div>
          <div>
            <label for="questionExplanation">Explication de la réponse (optionnel) :</label>
            <textarea id="questionExplanation" name="questionExplanation" rows="3"></textarea>
          </div>
          <button type="submit">Ajouter cette question</button>
        </form>
        <div id="questionsListContainer">
          <h3>Questions ajoutées (${currentCreatingQuiz.questions.length}) :</h3>
          ${currentCreatingQuiz.questions.length === 0 ? '<p>Aucune question ajoutée pour le moment.</p>' : ''}
          <ul id="questionsList">
            ${currentCreatingQuiz.questions.map((q, index) => `<li>${index + 1}. <strong>[${q.type || 'N/A'}]</strong> ${q.text.length > 50 ? q.text.substring(0, 50) + '...' : q.text} ${q.imageDataURL ? '<img src="'+q.imageDataURL+'" alt="Aperçu" class="question-list-preview-image">' : ''}</li>`).join('')}
          </ul>
        </div>
        <div class="form-actions">
            <button id="finishQuizButton" class="button-primary">Terminer et Sauvegarder le Quiz</button>
            <button id="cancelAddQuestionButton" class="button-secondary">Annuler / Quitter la création</button>
        </div>
        <style>
            #questionsListContainer { margin-top: 20px; }
            #questionsList { list-style-position: inside; padding-left: 0; }
            #questionsList li { margin-bottom: 5px; padding: 8px; background-color: #f9f9f9; border-radius: 4px; border: 1px solid #eee; display: flex; align-items: center; justify-content: space-between; }
            .form-actions { margin-top: 20px; display: flex; gap: 10px; }
            .mc-option { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
            .mc-option input[type="text"] { flex-grow: 1; margin-bottom: 0 !important; }
            .mc-correct-label { display: flex; align-items: center; white-space: nowrap; font-size: 0.9em; }
            .remove-mc-option { background: #ffdddd; color: #d00; border: 1px solid #ffaaaa; border-radius: 4px; padding: 2px 6px; font-size: 0.8em; cursor: pointer; }
            .remove-mc-option:hover { background: #ffcccc; }
        </style>
      `;
    } else {
      return `
        <h2>Créer un Nouveau Quiz</h2>
        <p>Entrez un titre pour votre nouveau quiz. Vous pourrez ensuite ajouter des questions.</p>
        <form id="createQuizForm">
          <div>
            <label for="quizTitle">Titre du Quiz :</label>
            <input type="text" id="quizTitle" name="quizTitle" required>
          </div>
          <button type="submit">Commencer à ajouter des questions</button>
        </form>
      `;
    }
  },
  '#view': async () => {
    try {
      const quizzes = await getAllQuizzes();
      let actionsHtml = `
        <div class="global-quiz-actions">
            <button id="exportAllQuizzesButton" title="Exporter tous les quiz en JSON"><img src="https://img.icons8.com/ios-glyphs/20/6e7dff/export.png" alt="Exporter Tous"> Exporter Tous</button>
            <button id="importQuizzesButton" title="Importer des quiz depuis un fichier JSON"><img src="https://img.icons8.com/ios-glyphs/20/6e7dff/import.png" alt="Importer"> Importer Quiz</button>
            <input type="file" id="importFile" accept=".json" style="display:none;">
        </div>`;

      if (quizzes.length === 0) {
        return `
          <h2>Voir les Quiz Existants</h2>
          ${actionsHtml}
          <p style="margin-top:15px;">Aucun quiz n'a été créé pour le moment.</p>
          <button onclick="window.location.hash='#create'">Créer votre premier Quiz</button>
        `;
      }
      return `
        <h2>Voir les Quiz Existants (${quizzes.length})</h2>
        ${actionsHtml}
        <ul id="quizListDisplay">
          ${quizzes.map(quiz => `
            <li>
              <div>
                <strong>${quiz.title}</strong> (ID: ${quiz.id})<br>
                <em>${quiz.questions ? quiz.questions.length : 0} question(s) - Créé le: ${new Date(quiz.createdAt).toLocaleDateString()}</em>
              </div>
              <div class="quiz-actions">
                <button onclick="handleExportQuiz(${quiz.id})" title="Exporter ce quiz (JSON)"><img src="https://img.icons8.com/ios-glyphs/20/4CAF50/export.png" alt="Exporter JSON"></button>
                <button onclick="navigateToEdit(${quiz.id})" title="Modifier le quiz"><img src="https://img.icons8.com/ios-glyphs/20/6e7dff/edit.png" alt="Modifier"></button>
                <button onclick="navigateToViewQuiz(${quiz.id})" title="Lancer le quiz"><img src="https://img.icons8.com/ios-glyphs/20/6e7dff/play--v1.png" alt="Lancer"></button> 
                <button onclick="handleDeleteQuiz(${quiz.id})" title="Supprimer le quiz"><img src="https://img.icons8.com/ios-glyphs/20/FD0000/trash.png" alt="Supprimer"></button>
              </div>
            </li>`).join('')}
        </ul>
        <style>
            .global-quiz-actions { display: flex; gap: 10px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
            .global-quiz-actions button { padding: 8px 12px; font-size: 0.9em; display: inline-flex; align-items: center; gap: 5px; }
            .global-quiz-actions button img { margin-right: 5px; }
            #quizListDisplay { list-style-type: none; padding: 0; }
            #quizListDisplay li { background-color: #fff; margin-bottom: 10px; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
            #quizListDisplay .quiz-actions button { background: none; border: none; padding: 5px; margin-left: 5px; cursor: pointer;}
            #quizListDisplay .quiz-actions button img { vertical-align: middle; }
        </style>
      `;
    } catch (error) {
      console.error("Failed to load quizzes:", error);
      showToast("Erreur lors du chargement des quiz. Vérifiez la console.", "error");
      return `<h2>Voir les Quiz Existants</h2><p>Erreur lors du chargement des quiz.</p>`;
    }
  },
  '#play': async () => {
    const params = new URLSearchParams(location.hash.split('?')[1]);
    const quizId = params.get('id');

    if (!quizId) {
      showToast("ID de quiz manquant pour jouer.", "error");
      window.location.hash = '#view';
      return "Redirection...";
    }

    try {
      currentPlayingQuiz = await getQuiz(Number(quizId));
      if (!currentPlayingQuiz || !currentPlayingQuiz.questions || currentPlayingQuiz.questions.length === 0) {
        showToast("Quiz non trouvé ou vide.", "error");
        currentPlayingQuiz = null;
        window.location.hash = '#view';
        return "Redirection...";
      }
      currentPlayQuestionIndex = 0;
      userPlayAnswers = new Array(currentPlayingQuiz.questions.length).fill(undefined);
      answerRevealedForQuestion = new Array(currentPlayingQuiz.questions.length).fill(false); 
      return renderPlayView();
    } catch (error) {
      console.error("Erreur lors du chargement du quiz pour jouer:", error);
      showToast("Erreur lors du chargement du quiz.", "error");
      window.location.hash = '#view';
      return "Redirection...";
    }
  },
  '#stats': () => `
    <h2>Statistiques</h2>
    <p>Des statistiques sur vos quiz seront disponibles ici prochainement.</p>
  `
};

function renderPlayView() {
  if (!currentPlayingQuiz) return "Erreur: Quiz non chargé.";
  const question = currentPlayingQuiz.questions[currentPlayQuestionIndex];
  const isRevealed = answerRevealedForQuestion[currentPlayQuestionIndex];
  let optionsHTML = '';
  let userAnswer = userPlayAnswers[currentPlayQuestionIndex];

  let isUserCorrect = false;
  if (isRevealed) {
    switch (question.type) {
        case 'multiple-choice':
            isUserCorrect = userAnswer !== undefined && question.options[userAnswer] && question.options[userAnswer].correct;
            break;
        case 'true-false':
            isUserCorrect = userAnswer === question.correctAnswer;
            break;
    }
  }

  switch (question.type) {
    case 'multiple-choice':
      optionsHTML = question.options.map((opt, index) => {
        let optClass = 'play-option';
        if (isRevealed) {
            if (opt.correct) optClass += ' play-option-correct-answer';
            if (userAnswer === index) { 
              optClass += (isUserCorrect ? ' play-option-user-correct' : ' play-option-user-incorrect');
            }
        }
        return `
        <label class="${optClass}">
          <input type="radio" name="playAnswer" value="${index}" ${userAnswer === index ? 'checked' : ''} ${isRevealed ? 'disabled' : ''}>
          ${opt.text}
        </label>
      `}).join('');
      break;
    case 'true-false':
      const trueSelected = userAnswer === true;
      const falseSelected = userAnswer === false;
      let trueClass = 'play-option';
      let falseClass = 'play-option';
      if (isRevealed) {
          if (question.correctAnswer === true) trueClass += ' play-option-correct-answer';
          else falseClass += ' play-option-correct-answer';

          if (trueSelected) trueClass += (isUserCorrect ? ' play-option-user-correct' : ' play-option-user-incorrect');
          if (falseSelected) falseClass += (isUserCorrect ? ' play-option-user-correct' : ' play-option-user-incorrect');
      }
      optionsHTML = `
        <label class="${trueClass}">
          <input type="radio" name="playAnswer" value="true" ${trueSelected ? 'checked' : ''} ${isRevealed ? 'disabled' : ''}> Vrai
        </label>
        <label class="${falseClass}">
          <input type="radio" name="playAnswer" value="false" ${falseSelected ? 'checked' : ''} ${isRevealed ? 'disabled' : ''}> Faux
        </label>
      `;
      break;
    case 'open-ended':
      optionsHTML = `
        <textarea id="playOpenAnswer" name="playAnswer" rows="4" placeholder="Votre réponse..." ${isRevealed ? 'disabled' : ''}>${userAnswer || ''}</textarea>
        ${isRevealed && question.explanation ? `<div class="play-explanation-inline"><strong>Explication :</strong> ${question.explanation}</div>` : ''}
      `; 
      break;
  }
  
  let generalExplanationHTML = '';
  if (isRevealed && question.explanation && question.type !== 'open-ended') {
    generalExplanationHTML = `<div class="play-explanation"><strong>Explication :</strong> ${question.explanation}</div>`;
  }
  
  const imageHTML = question.imageDataURL ? `<img src="${question.imageDataURL}" alt="Image de la question" class="question-image-display">` : '';


  return `
    <div class="play-quiz-container">
      <h2>${currentPlayingQuiz.title}</h2>
      <div class="play-question-header">
        <h3>Question ${currentPlayQuestionIndex + 1} / ${currentPlayingQuiz.questions.length}</h3>
        <p class="play-question-text">${question.text}</p>
        ${imageHTML}
      </div>
      <form id="playForm" class="play-options">${optionsHTML}</form>
      ${generalExplanationHTML}
      <div class="play-actions">
        ${!isRevealed ? '<button id="showCorrectionButton" disabled>Voir la correction</button>' : '<button id="correctionShownButton" disabled>Correction affichée</button>'}
      </div>
      <div class="play-navigation">
        <button id="playPrevButton" ${currentPlayQuestionIndex === 0 ? 'disabled' : ''}>Précédent</button>
        <button id="playNextButton">${currentPlayQuestionIndex === currentPlayingQuiz.questions.length - 1 ? 'Terminer le Quiz' : 'Suivant'}</button>
      </div>
    </div>
    <style>
      .play-quiz-container { padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      .play-question-header { margin-bottom: 20px; }
      .play-question-text { font-size: 1.2em; margin-bottom: 15px; }
      .play-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; }
      .play-option { display: block; padding: 10px; background: #f9f9f9; border-radius: 5px; cursor: pointer; border: 2px solid transparent; transition: border-color 0.3s, background-color 0.3s;}
      .play-option:hover:not([disabled]) { background: #f0f0f0; }
      .play-option input[type="radio"] { margin-right: 10px; }
      #playOpenAnswer { width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #ccc; font-family: inherit; }
      .play-actions { margin-bottom: 20px; text-align: center; }
      .play-actions button { padding: 8px 15px; }
      .play-navigation { display: flex; justify-content: space-between; margin-top: 20px; }
      .play-navigation button { padding: 10px 20px; }
      
      .play-option-correct-answer { 
        border: 2px solid #28a745 !important; 
        background-color: #e6ffed !important;
        font-weight: bold;
      }
      .play-option-user-incorrect { 
        border: 2px solid #dc3545 !important; 
        background-color: #ffe6e6 !important; 
        color: #721c24;
      }
      .play-option-user-correct {}
      .play-explanation, .play-explanation-inline { 
        margin-top: 15px; 
        padding: 10px; 
        background-color: #eef2f7; 
        border-left: 4px solid #6e7dff; 
        font-size: 0.95em; 
        color: #333;
      }
      .play-explanation-inline { margin-top: 5px; }

      .play-results-summary { margin-top: 20px; }
      .play-results-summary h3 { margin-bottom: 15px; }
      .play-results-summary ul { list-style: none; padding: 0; }
      .play-results-summary li { margin-bottom: 15px; padding: 10px; border-radius: 5px; }
      .play-results-summary .correct { background-color: #e6ffed; border: 1px solid #c3e6cb; }
      .play-results-summary .incorrect { background-color: #ffe6e6; border: 1px solid #f5c6cb; }
      .play-results-summary p { margin: 5px 0; }
      .play-results-summary .explanation { font-style: italic; color: #555; font-size: 0.9em; margin-top: 5px;}

      #celebrationAnimationPlaceholder { text-align: center; margin-bottom: 15px; min-height: 50px; /* Espace pour l'animation */ }
    </style>
  `;
}

function triggerCelebrationAnimation(animationType) {
    const container = document.getElementById('celebrationAnimationPlaceholder');
    if (!container) return;

    let htmlContent = '';
    container.innerHTML = ''; 
    container.className = 'celebration-active'; 

    switch (animationType) {
        case 'popAndSparkle':
            htmlContent = `
                <div class="congrats-message anim-pop-and-sparkle">
                    🎉 Félicitations ! 🎉
                    <div class="sparkle s1"></div> <div class="sparkle s2"></div> 
                    <div class="sparkle s3"></div> <div class="sparkle s4"></div>
                </div>`;
            container.innerHTML = htmlContent;
            break;
        case 'gentleShine':
            htmlContent = `<div class="congrats-message anim-gentle-shine">🏆 Super Score ! 🏆</div>`;
            container.innerHTML = htmlContent;
            break;
        default:
            htmlContent = `<div class="congrats-message">👍 Bravo !</div>`; 
            container.innerHTML = htmlContent;
            break;
    }
    setTimeout(() => {
        container.innerHTML = ''; 
        container.className = '';
    }, 5000); 
}

function triggerFullScreenCelebration(type) {
    let overlay = document.getElementById('fullScreenCelebrationOverlay');
    if (overlay) {
        overlay.remove(); 
    }

    overlay = document.createElement('div');
    overlay.id = 'fullScreenCelebrationOverlay';
    document.body.appendChild(overlay);

    if (type === 'confetti') {
        const confettiCount = 100; 
        const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
        for (let i = 0; i < confettiCount; i++) {
            const confettiPiece = document.createElement('div');
            confettiPiece.classList.add('confetti-piece');
            confettiPiece.style.left = Math.random() * 100 + 'vw';
            confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confettiPiece.style.width = Math.random() * 8 + 5 + 'px'; 
            confettiPiece.style.height = Math.random() * 15 + 8 + 'px'; 
            confettiPiece.style.opacity = Math.random() * 0.5 + 0.5; 
            const duration = Math.random() * 3 + 4; 
            const delay = Math.random() * 2; 
            confettiPiece.style.animation = `fallAndRotate ${duration}s linear ${delay}s forwards`;
            overlay.appendChild(confettiPiece);
        }
    }

    setTimeout(() => {
        if (overlay) {
            overlay.remove();
        }
    }, 7000); 
}


function renderPlayResults() {
  let score = 0;
  let summaryHTML = '<ul>';
  const scorableQuestionsCount = currentPlayingQuiz.questions.filter(q => q.type !== 'open-ended').length;

  currentPlayingQuiz.questions.forEach((q, index) => {
    let userAnswerDisplay = userPlayAnswers[index];
    let correctAnswerDisplay = '';
    let isCorrect = false;
    const imageHTML = q.imageDataURL ? `<img src="${q.imageDataURL}" alt="Image de la question" class="question-image-display" style="max-height:100px;">` : '';


    switch (q.type) {
      case 'multiple-choice':
        const selectedOptionIndex = userPlayAnswers[index];
        userAnswerDisplay = selectedOptionIndex !== undefined && q.options[selectedOptionIndex] ? q.options[selectedOptionIndex].text : "Pas de réponse";
        const correctOption = q.options.find(opt => opt.correct);
        correctAnswerDisplay = correctOption ? correctOption.text : "N/A";
        isCorrect = selectedOptionIndex !== undefined && q.options[selectedOptionIndex] && q.options[selectedOptionIndex].correct;
        break;
      case 'true-false':
        userAnswerDisplay = userPlayAnswers[index] === true ? "Vrai" : (userPlayAnswers[index] === false ? "Faux" : "Pas de réponse");
        correctAnswerDisplay = q.correctAnswer ? "Vrai" : "Faux";
        isCorrect = userPlayAnswers[index] === q.correctAnswer;
        break;
      case 'open-ended':
        userAnswerDisplay = userPlayAnswers[index] || "Pas de réponse";
        correctAnswerDisplay = q.explanation || "Réponse ouverte (vérification manuelle)"; 
        isCorrect = userAnswerDisplay !== "Pas de réponse"; 
        break;
    }
    if (isCorrect && q.type !== 'open-ended') score++; 

    summaryHTML += `
      <li class="${isCorrect && q.type !== 'open-ended' ? 'correct' : (q.type !== 'open-ended' && userAnswerDisplay !== "Pas de réponse" ? 'incorrect' : '')}">
        <p><strong>Question ${index + 1}:</strong> ${q.text}</p>
        ${imageHTML}
        <p>Votre réponse: ${userAnswerDisplay}</p>
        ${q.type !== 'open-ended' ? `<p>Réponse correcte: ${correctAnswerDisplay}</p>` : ''}
        ${q.explanation ? `<p class="explanation">Explication: ${q.explanation}</p>` : ''}
      </li>
    `;
  });
  summaryHTML += '</ul>';

  let resultPageHTML = `
    <div class="play-quiz-container">
      <h2>Résultats du Quiz: ${currentPlayingQuiz.title}</h2>
      <div id="celebrationAnimationPlaceholder"></div>
      <h3>Votre score: ${score} / ${scorableQuestionsCount}</h3>
      ${scorableQuestionsCount !== currentPlayingQuiz.questions.length ? '<p>(Les questions à réponse ouverte ne sont pas notées automatiquement)</p>' : ''}
      <div class="play-results-summary">
        <h3>Résumé des réponses :</h3>
        ${summaryHTML}
      </div>
      <div class="play-navigation">
        <button id="playAgainButton">Recommencer ce Quiz</button>
        <button id="backToQuizListButton">Retourner à la liste des Quiz</button>
      </div>
    </div>
  `;
  appContainer.innerHTML = resultPageHTML;

  const percentageScore = scorableQuestionsCount > 0 ? (score / scorableQuestionsCount) * 100 : 0;

  if (percentageScore === 100 && scorableQuestionsCount > 0) {
    const fullScreenAnimationTypes = ['confetti']; 
    const chosenFullScreenAnimation = fullScreenAnimationTypes[Math.floor(Math.random() * fullScreenAnimationTypes.length)];
    triggerFullScreenCelebration(chosenFullScreenAnimation);
  } else if (percentageScore >= GOOD_SCORE_THRESHOLD_PERCENT) {
    const animationTypes = ['popAndSparkle', 'gentleShine'];
    const chosenAnimation = animationTypes[Math.floor(Math.random() * animationTypes.length)];
    triggerCelebrationAnimation(chosenAnimation);
  }


  document.getElementById('playAgainButton').addEventListener('click', () => {
    window.location.hash = `#play?id=${currentPlayingQuiz.id}`;
  });
  document.getElementById('backToQuizListButton').addEventListener('click', () => {
    currentPlayingQuiz = null;
    window.location.hash = '#view';
  });
}


function saveCurrentPlayAnswer() {
    if (!currentPlayingQuiz || answerRevealedForQuestion[currentPlayQuestionIndex]) return; 
    
    const question = currentPlayingQuiz.questions[currentPlayQuestionIndex];
    const form = document.getElementById('playForm');
    if (!form) return;

    switch (question.type) {
        case 'multiple-choice':
            const selectedRadioMC = form.querySelector('input[name="playAnswer"]:checked');
            userPlayAnswers[currentPlayQuestionIndex] = selectedRadioMC ? parseInt(selectedRadioMC.value) : undefined;
            break;
        case 'true-false':
            const selectedRadioTF = form.querySelector('input[name="playAnswer"]:checked');
            userPlayAnswers[currentPlayQuestionIndex] = selectedRadioTF ? (selectedRadioTF.value === 'true') : undefined;
            break;
        case 'open-ended':
            const openAnswer = document.getElementById('playOpenAnswer');
            userPlayAnswers[currentPlayQuestionIndex] = openAnswer ? openAnswer.value.trim() : undefined;
            break;
    }
    const showCorrectionBtn = document.getElementById('showCorrectionButton');
    if (showCorrectionBtn) {
        const userAnswer = userPlayAnswers[currentPlayQuestionIndex];
        const hasAnswered = (question.type === 'open-ended' && userAnswer !== undefined && userAnswer !== '') || (question.type !== 'open-ended' && userAnswer !== undefined);
        showCorrectionBtn.disabled = !hasAnswered;
    }
}


function updateActiveLink(currentHash) {
  const baseHash = currentHash.split('?')[0]; 
  navLinks.forEach(link => {
    if (link.getAttribute('href') === baseHash) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

async function renderContent() {
  const hash = window.location.hash || '#home';
  if (!hash.startsWith('#create') && currentCreatingQuiz) { 
    handleRemoveImage(); 
  }

  const baseHash = hash.split('?')[0];
  let contentGenerator = pages[baseHash] || pages['#home'];
  
  appContainer.innerHTML = typeof contentGenerator === 'function' ? await contentGenerator() : contentGenerator;
  
  updateActiveLink(hash); 
  attachEventListeners(hash); 
}


function attachEventListeners(currentHash) {
  const baseHash = currentHash.split('?')[0];
  if (baseHash === '#create') {
    if (currentCreatingQuiz) {
      const addQuestionForm = document.getElementById('addQuestionForm');
      if (addQuestionForm) addQuestionForm.addEventListener('submit', handleAddQuestion);
      
      const finishQuizButton = document.getElementById('finishQuizButton');
      if (finishQuizButton) finishQuizButton.addEventListener('click', handleFinishQuiz);

      const cancelAddQuestionButton = document.getElementById('cancelAddQuestionButton');
      if (cancelAddQuestionButton) cancelAddQuestionButton.addEventListener('click', handleCancelCreation);

      const questionTypeSelect = document.getElementById('questionType');
      if (questionTypeSelect) {
        questionTypeSelect.addEventListener('change', (e) => renderQuestionTypeSpecificFields(e.target.value));
        renderQuestionTypeSpecificFields(questionTypeSelect.value); 
      }
      
      const questionImageInput = document.getElementById('questionImage');
      if (questionImageInput) questionImageInput.addEventListener('change', handleImageUpload);
      
      const removeImageButton = document.getElementById('removeImageButton');
      if (removeImageButton) removeImageButton.addEventListener('click', handleRemoveImage);


    } else {
      const createQuizForm = document.getElementById('createQuizForm');
      if (createQuizForm) createQuizForm.addEventListener('submit', handleCreateQuizTitle);
    }
  } else if (baseHash === '#view') {
        const exportAllButton = document.getElementById('exportAllQuizzesButton');
        if (exportAllButton) exportAllButton.addEventListener('click', handleExportAllQuizzes);

        const importButton = document.getElementById('importQuizzesButton');
        const importFileInput = document.getElementById('importFile');
        if (importButton && importFileInput) {
            importButton.addEventListener('click', () => importFileInput.click());
            importFileInput.addEventListener('change', handleImportFileSelect);
        }
  } else if (baseHash === '#play' && !document.getElementById('playAgainButton')) { 
      const showCorrectionBtn = document.getElementById('showCorrectionButton');
      if (showCorrectionBtn) {
        showCorrectionBtn.addEventListener('click', () => {
          if (!answerRevealedForQuestion[currentPlayQuestionIndex]) {
            saveCurrentPlayAnswer(); 
            answerRevealedForQuestion[currentPlayQuestionIndex] = true;
            appContainer.innerHTML = renderPlayView(); 
            attachEventListeners(window.location.hash); 
          }
        });
      }

      const prevButton = document.getElementById('playPrevButton');
      if (prevButton) prevButton.addEventListener('click', () => {
          if (!answerRevealedForQuestion[currentPlayQuestionIndex]) { 
             saveCurrentPlayAnswer();
          }
          if (currentPlayQuestionIndex > 0) {
              currentPlayQuestionIndex--;
              appContainer.innerHTML = renderPlayView();
              attachEventListeners(window.location.hash); 
          }
      });
      const nextButton = document.getElementById('playNextButton');
      if (nextButton) nextButton.addEventListener('click', () => {
          if (!answerRevealedForQuestion[currentPlayQuestionIndex]) { 
            saveCurrentPlayAnswer();
          }
          if (currentPlayQuestionIndex < currentPlayingQuiz.questions.length - 1) {
              currentPlayQuestionIndex++;
              appContainer.innerHTML = renderPlayView();
              attachEventListeners(window.location.hash); 
          } else {
              renderPlayResults(); 
          }
      });
      
      const playForm = document.getElementById('playForm');
      if(playForm && !answerRevealedForQuestion[currentPlayQuestionIndex]) { 
        playForm.addEventListener('input', () => { 
            const correctionBtn = document.getElementById('showCorrectionButton');
            if (correctionBtn) {
                const question = currentPlayingQuiz.questions[currentPlayQuestionIndex];
                let answered = false;
                if (question.type === 'open-ended') {
                    const openAnswer = document.getElementById('playOpenAnswer');
                    answered = openAnswer && openAnswer.value.trim() !== '';
                } else {
                    answered = playForm.querySelector('input[name="playAnswer"]:checked') !== null;
                }
                correctionBtn.disabled = !answered;
            }
        });
      }
  }
}

async function handleCreateQuizTitle(event) {
  event.preventDefault();
  const quizTitle = event.target.quizTitle.value.trim();
  if (!quizTitle) {
    showToast('Veuillez entrer un titre pour le quiz.', 'warning');
    return;
  }
  try {
    const quizData = { title: quizTitle, questions: [], createdAt: new Date().toISOString() };
    const newQuizId = await addQuiz(quizData); 

    currentCreatingQuiz = { id: newQuizId, title: quizTitle, questions: [] }; 
    renderContent(); 
  } catch (error) {
    console.error('Erreur lors de la création du quiz:', error);
    showToast('Erreur lors de la création du quiz.', 'error');
  }
}

async function handleAddQuestion(event) {
  event.preventDefault();
  if (!currentCreatingQuiz) return;

  const form = event.target;
  const questionText = form.questionText.value.trim();
  const questionExplanation = form.questionExplanation.value.trim();
  const questionType = form.questionType.value;

  if (!questionText) {
    showToast('Veuillez entrer le texte de la question.', 'warning');
    return;
  }

  const newQuestion = {
    id: Date.now(), 
    text: questionText,
    explanation: questionExplanation,
    type: questionType,
    imageDataURL: currentQuestionImageBase64 
  };

  switch (questionType) {
    case 'multiple-choice':
      const options = [];
      const optionTextElements = form.elements['mcOptionText[]'];
      const optionCorrectElements = form.elements['mcOptionCorrect[]'];
      
      const texts = optionTextElements.length === undefined ? [optionTextElements] : Array.from(optionTextElements);
      const corrects = optionCorrectElements.length === undefined ? [optionCorrectElements] : Array.from(optionCorrectElements);

      if (texts.length < 2) {
        showToast('Les questions à choix multiples doivent avoir au moins 2 options.', 'warning');
        return;
      }
      let hasCorrect = false;
      for (let i = 0; i < texts.length; i++) {
        const text = texts[i].value.trim();
        if (!text) {
          showToast(`Veuillez entrer le texte pour l'option ${i + 1}.`, 'warning');
          return;
        }
        const isCorrect = corrects[i].checked;
        if (isCorrect) hasCorrect = true;
        options.push({ text: text, correct: isCorrect });
      }
      if (!hasCorrect) {
          showToast('Veuillez marquer au moins une option comme correcte pour une question à choix multiple.', 'warning');
          return;
      }
      newQuestion.options = options;
      break;
    case 'true-false':
      newQuestion.correctAnswer = form.tfCorrectAnswer.value === 'true';
      break;
    case 'open-ended':
      break;
  }

  currentCreatingQuiz.questions.push(newQuestion);
  
  try {
    await updateQuiz(currentCreatingQuiz); 
    showToast('Question ajoutée au quiz !', 'success');
    handleRemoveImage(); 
    const currentSelectedType = document.getElementById('questionType').value;
    renderContent().then(() => {
        const typeSelect = document.getElementById('questionType');
        if (typeSelect) {
            typeSelect.value = currentSelectedType;
            renderQuestionTypeSpecificFields(currentSelectedType);
        }
        const qText = document.getElementById('questionText');
        const qExplain = document.getElementById('questionExplanation');
        if (qText) qText.value = '';
        if (qExplain) qExplain.value = '';
        if(qText) qText.focus();
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du quiz avec la nouvelle question:', error);
    showToast('Erreur lors de l\'ajout de la question.', 'error');
    currentCreatingQuiz.questions.pop(); 
  }
}

async function handleFinishQuiz() {
  if (!currentCreatingQuiz) return;
  if (currentCreatingQuiz.questions.length === 0) {
      if (!confirm("Ce quiz ne contient aucune question. Voulez-vous vraiment le sauvegarder ainsi ?")) {
          return;
      }
  }
  try {
    await updateQuiz(currentCreatingQuiz); 
    showToast(`Quiz "${currentCreatingQuiz.title}" sauvegardé avec ${currentCreatingQuiz.questions.length} questions!`, 'success');
    currentCreatingQuiz = null; 
    handleRemoveImage(); 
    window.location.hash = '#view'; 
  } catch (error) {
    console.error('Erreur lors de la finalisation du quiz:', error);
    showToast('Erreur lors de la sauvegarde finale du quiz.', 'error');
  }
}

function handleCancelCreation() {
    if (currentCreatingQuiz) {
        let message = "Êtes-vous sûr de vouloir annuler la création/modification de ce quiz ? ";
        if (currentCreatingQuiz.id && currentCreatingQuiz.questions.length > 0) {
            message += "Les modifications non sauvegardées pour les questions individuelles seront perdues. Le quiz conservera son état précédent.";
        } else if (!currentCreatingQuiz.id) { 
            message += "Le nouveau quiz ne sera pas sauvegardé et les questions ajoutées seront perdues."
        } else {
             message += "Aucune modification ne sera perdue."
        }

        if (confirm(message)) {
            currentCreatingQuiz = null;
            handleRemoveImage(); 
            window.location.hash = '#view'; 
        }
    } else {
        handleRemoveImage(); 
        window.location.hash = '#home'; 
    }
}

window.handleDeleteQuiz = async (quizId) => { 
    if (confirm(`Êtes-vous sûr de vouloir supprimer le quiz ID ${quizId} ? Cette action est irréversible.`)) {
        try {
            await deleteQuizDB(quizId);
            showToast(`Quiz ID ${quizId} supprimé.`, 'info');
            if (window.location.hash === '#view') {
                renderContent(); 
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du quiz:', error);
            showToast('Erreur lors de la suppression du quiz.', 'error');
        }
    }
};

window.handleExportQuiz = handleExportQuiz; // Expose to global scope for onclick

window.navigateToEdit = async (quizId) => {
    try {
        const quizToEdit = await getQuiz(quizId);
        if (quizToEdit) {
            currentCreatingQuiz = quizToEdit;
            handleRemoveImage(); 
            window.location.hash = '#create'; 
        } else {
            showToast("Quiz non trouvé.", 'error');
            window.location.hash = '#view'; 
        }
    } catch (error) {
        console.error("Erreur lors du chargement du quiz pour modification:", error);
        showToast("Erreur lors du chargement du quiz pour modification.", 'error');
    }
};

window.navigateToViewQuiz = (quizId) => {
  window.location.hash = `#play?id=${quizId}`;
};

async function addSampleCyberQuizIfNotExists() {
    const sampleQuizTitle = "Quiz d'introduction à la Cybersécurité";
    try {
        const quizzes = await getAllQuizzes();
        const existingSampleQuiz = quizzes.find(quiz => quiz.title === sampleQuizTitle);

        if (!existingSampleQuiz) {
            const sampleQuiz = {
                title: sampleQuizTitle,
                questions: [ 
                    { id: Date.now()+1, text: "Qu'est-ce qu'un mot de passe fort ?", type: "multiple-choice", explanation: "Un mot de passe fort combine majuscules, minuscules, chiffres et symboles, et est suffisamment long.", options: [
                        { text: "Un mot courant facile à retenir", correct: false },
                        { text: "Une combinaison de lettres majuscules, minuscules, chiffres et symboles", correct: true },
                        { text: "Le nom de votre animal de compagnie", correct: false },
                        { text: "Votre date de naissance", correct: false }
                    ], imageDataURL: null}, 
                    { id: Date.now()+2, text: "Est-il sécurisé d'utiliser le même mot de passe pour plusieurs comptes en ligne ?", type: "true-false", correctAnswer: false, explanation: "Non, si un compte est compromis, tous les autres utilisant le même mot de passe le seront aussi.", imageDataURL: null },
                    { id: Date.now()+3, text: "Qu'est-ce que l'hameçonnage (phishing) ?", type: "multiple-choice", explanation: "L'hameçonnage est une tentative frauduleuse d'obtenir des informations sensibles en se faisant passer pour une entité de confiance.", options: [
                        { text: "Une technique de pêche sportive", correct: false },
                        { text: "Un logiciel antivirus", correct: false },
                        { text: "Une tentative de vol d'informations personnelles via email ou SMS frauduleux", correct: true },
                        { text: "Un type de cookie de navigateur", correct: false }
                    ], imageDataURL: null },
                     { id: Date.now()+4, text: "Si un email semble provenir de votre responsable et demande des informations urgentes, il est toujours sûr de répondre.", type: "true-false", correctAnswer: false, explanation: "Non, vérifiez toujours l'authenticité de la demande par un autre moyen (appel, message direct) avant de partager des informations sensibles.", imageDataURL: null },
                    { id: Date.now()+5, text: "Laquelle de ces caractéristiques est un signe courant d'un email d'hameçonnage ?", type: "multiple-choice", explanation: "Les emails d'hameçonnage créent souvent un sentiment d'urgence, contiennent des fautes, ou des liens suspects.", options: [
                        { text: "Une grammaire parfaite et une adresse email de l'expéditeur connue", correct: false },
                        { text: "Une demande de cliquer sur un lien ou d'ouvrir une pièce jointe pour une action urgente", correct: true },
                        { text: "Un message personnalisé avec votre nom complet", correct: false },
                        { text: "Une absence totale de liens ou de pièces jointes", correct: false }
                    ], imageDataURL: null },
                    { id: Date.now()+6, text: "Qu'est-ce qu'un logiciel malveillant (malware) ?", type: "multiple-choice", explanation: "Un malware est un logiciel conçu pour nuire ou exploiter un système informatique.", options: [
                        { text: "Un composant matériel de l'ordinateur", correct: false },
                        { text: "Un logiciel conçu pour endommager ou accéder illicitement à un système", correct: true },
                        { text: "Une mise à jour de sécurité", correct: false },
                        { text: "Un type de navigateur web", correct: false }
                    ], imageDataURL: null },
                    { id: Date.now()+7, text: "L'installation d'un logiciel antivirus garantit une protection à 100% contre tous les malwares.", type: "true-false", correctAnswer: false, explanation: "Non, bien qu'essentiel, un antivirus n'est pas infaillible. La vigilance et les bonnes pratiques restent cruciales.", imageDataURL: null },
                    { id: Date.now()+8, text: "Parmi les actions suivantes, laquelle est la plus risquée pour la sécurité de vos données sur un réseau Wi-Fi public ?", type: "multiple-choice", explanation: "Effectuer des transactions bancaires sur un Wi-Fi public non sécurisé est très risqué.", options: [
                        { text: "Consulter les actualités", correct: false },
                        { text: "Regarder des vidéos en streaming", correct: false },
                        { text: "Effectuer des transactions bancaires", correct: true },
                        { text: "Lire ses emails (sans pièces jointes sensibles)", correct: false }
                    ], imageDataURL: null },
                    { id: Date.now()+9, text: "Que signifie 'HTTPS' au début d'une URL de site web ?", type: "multiple-choice", explanation: "HTTPS indique que la connexion entre votre navigateur et le site web est chiffrée et sécurisée.", options: [
                        { text: "Que le site est très populaire", correct: false },
                        { text: "Que la connexion est sécurisée et chiffrée", correct: true },
                        { text: "Que le site contient beaucoup d'images", correct: false },
                        { text: "Que le site est optimisé pour les mobiles", correct: false }
                    ], imageDataURL: null },
                    { id: Date.now()+10, text: "L'authentification à deux facteurs (2FA) ajoute une couche de sécurité supplémentaire à vos comptes.", type: "true-false", correctAnswer: true, explanation: "Oui, la 2FA requiert une deuxième forme de vérification en plus du mot de passe, rendant l'accès non autorisé plus difficile.", imageDataURL: null },
                    { id: Date.now()+11, text: "Qu'est-ce qu'un 'ransomware' (rançongiciel) ?", type: "multiple-choice", explanation: "Un ransomware chiffre vos fichiers et demande une rançon pour les débloquer.", options: [
                        { text: "Un logiciel qui nettoie les fichiers inutiles", correct: false },
                        { text: "Un type de malware qui bloque l'accès à vos fichiers et demande une rançon", correct: true },
                        { text: "Un outil de sauvegarde de données", correct: false },
                        { text: "Un pare-feu amélioré", correct: false }
                    ], imageDataURL: null },
                     { id: Date.now()+12, text: "Il est important de mettre à jour régulièrement vos logiciels et votre système d'exploitation.", type: "true-false", correctAnswer: true, explanation: "Les mises à jour corrigent souvent des failles de sécurité qui pourraient être exploitées par des attaquants.", imageDataURL: null },
                     { id: Date.now()+13, text: "L'ingénierie sociale repose principalement sur des failles techniques des systèmes.", type: "true-false", correctAnswer: false, explanation: "Non, l'ingénierie sociale exploite la psychologie humaine (confiance, peur, curiosité) pour manipuler les individus.", imageDataURL: null },
                     { id: Date.now()+14, text: "Quel est le rôle principal d'un pare-feu (firewall) ?", type: "multiple-choice", explanation: "Un pare-feu surveille et contrôle le trafic réseau entrant et sortant pour bloquer les accès non autorisés.", options: [
                        { text: "Accélérer la connexion internet", correct: false },
                        { text: "Protéger contre les surtensions électriques", correct: false },
                        { text: "Filtrer le trafic réseau pour bloquer les menaces", correct: true },
                        { text: "Stocker des copies de sauvegarde des fichiers", correct: false }
                    ], imageDataURL: null },
                    { id: Date.now()+15, text: "Partager des informations personnelles sensibles (date de naissance, adresse) sur les réseaux sociaux est sans risque.", type: "true-false", correctAnswer: false, explanation: "Non, ces informations peuvent être utilisées pour l'usurpation d'identité ou d'autres activités malveillantes.", imageDataURL: null },
                    { id: Date.now()+16, text: "Qu'est-ce qu'une 'faille zero-day' ?", type: "multiple-choice", explanation: "Une faille zero-day est une vulnérabilité logicielle inconnue du développeur, donc sans correctif disponible.", options: [
                        { text: "Une offre promotionnelle d'antivirus valable un jour", correct: false },
                        { text: "Une vulnérabilité logicielle qui n'a pas encore de correctif public", correct: true },
                        { text: "Un système d'exploitation totalement sécurisé", correct: false },
                        { text: "Une attaque qui se produit uniquement le premier jour du mois", correct: false }
                    ], imageDataURL: null },
                    { id: Date.now()+17, text: "L'utilisation d'un VPN (Réseau Privé Virtuel) rend votre activité en ligne totalement anonyme.", type: "true-false", correctAnswer: false, explanation: "Un VPN chiffre votre trafic et masque votre IP, améliorant la confidentialité, mais ne garantit pas l'anonymat total.", imageDataURL: null },
                    { id: Date.now()+18, text: "Que faire si vous suspectez avoir cliqué sur un lien d'hameçonnage ou téléchargé un malware ?", type: "multiple-choice", explanation: "Déconnectez-vous d'Internet, analysez votre appareil et changez vos mots de passe depuis un appareil sûr.", options: [
                        { text: "Ignorer et continuer à travailler", correct: false },
                        { text: "Éteindre l'ordinateur et attendre quelques heures", correct: false },
                        { text: "Se déconnecter d'Internet, lancer une analyse antivirus et changer les mots de passe importants", correct: true },
                        { text: "Supprimer l'email suspect uniquement", correct: false }
                    ], imageDataURL: null },
                    { id: Date.now()+19, text: "Les sauvegardes régulières de vos données importantes ne sont utiles qu'en cas de panne matérielle.", type: "true-false", correctAnswer: false, explanation: "Les sauvegardes sont cruciales en cas de panne, d'attaque par ransomware, de suppression accidentelle ou de vol d'appareil.", imageDataURL: null },
                    { id: Date.now()+20, text: "Un 'cookie' de navigateur est toujours malveillant.", type: "true-false", correctAnswer: false, explanation: "Non, les cookies peuvent être utiles (connexion, préférences). Cependant, les cookies tiers peuvent être utilisés pour le suivi publicitaire, soulevant des questions de vie privée.", imageDataURL: null }
                ]
            };
            await addQuiz(sampleQuiz);
            showToast("Quiz d'exemple sur la cybersécurité ajouté !", 'success', 5000);
            if (window.location.hash === '#view' || window.location.hash.startsWith('#play')) {
                renderContent();
            }
        } else {
            console.log("Le quiz d'exemple sur la cybersécurité existe déjà.");
        }
    } catch (error) {
        console.error("Erreur lors de l'ajout du quiz d'exemple :", error);
        showToast("Erreur lors de la vérification/ajout du quiz d'exemple.", 'error');
    }
}


window.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDB(); 
    await addSampleCyberQuizIfNotExists();
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '#home';
    } 
    renderContent(); 
    
  } catch (error) {
    console.error("Erreur à l'initialisation de l'application:", error);
    showToast("Erreur critique au chargement. Vérifiez la console.", "error", 10000);
    appContainer.innerHTML = "<p>Erreur critique lors du chargement de l'application. Vérifiez la console.</p>";
  }
});

window.addEventListener('hashchange', renderContent);