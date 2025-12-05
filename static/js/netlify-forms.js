// Netlify Forms AJAX Handler
// Обрабатывает отправку форм с data-netlify="true" через AJAX

(function() {
  // Ждем загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNetlifyForms);
  } else {
    initNetlifyForms();
  }

  function initNetlifyForms() {
    // Находим все формы с data-netlify="true"
    const netlifyForms = document.querySelectorAll('form[data-netlify="true"]');
    
    netlifyForms.forEach(function(form) {
      // Предотвращаем стандартную отправку формы
      form.addEventListener('submit', function(event) {
        event.preventDefault();
        handleFormSubmit(form);
      });
    });
  }

  function handleFormSubmit(form) {
    const formWrapper = form.closest('.w-form');
    const submitButton = form.querySelector('input[type="submit"], button[type="submit"]');
    const originalValue = submitButton ? submitButton.value : '';
    const waitText = submitButton ? submitButton.getAttribute('data-wait') : 'Please wait...';
    
    // Показываем состояние загрузки
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.value = waitText || 'Please wait...';
    }
    
    // Скрываем предыдущие сообщения
    if (formWrapper) {
      const successMsg = formWrapper.querySelector('.w-form-done, .success-message, .success-message-2');
      const errorMsg = formWrapper.querySelector('.w-form-fail, .error-message, .error-message-2');
      if (successMsg) {
        successMsg.style.display = 'none';
        formWrapper.classList.remove('w-form-done');
      }
      if (errorMsg) {
        errorMsg.style.display = 'none';
        formWrapper.classList.remove('w-form-fail');
      }
    }
    
    // Создаем FormData
    const formData = new FormData(form);
    
    // Отправляем через fetch
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    })
    .then(function(response) {
      // Netlify возвращает 200 или 302 при успешной отправке
      if (response.ok || response.status === 302) {
        showSuccess(formWrapper);
        form.reset();
      } else {
        showError(formWrapper);
      }
    })
    .catch(function(error) {
      console.error('Form submission error:', error);
      showError(formWrapper);
    })
    .finally(function() {
      // Восстанавливаем кнопку
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.value = originalValue;
      }
    });
  }

  function showSuccess(formWrapper) {
    if (!formWrapper) {
      // Если нет обертки, просто показываем alert
      alert('Thank you! Your submission has been received!');
      return;
    }
    
    const successMsg = formWrapper.querySelector('.w-form-done, .success-message, .success-message-2');
    const errorMsg = formWrapper.querySelector('.w-form-fail, .error-message, .error-message-2');
    
    if (successMsg) {
      successMsg.style.display = 'block';
      // Добавляем класс для анимации Webflow
      formWrapper.classList.add('w-form-done');
      formWrapper.classList.remove('w-form-fail');
    }
    
    if (errorMsg) {
      errorMsg.style.display = 'none';
    }
  }

  function showError(formWrapper) {
    if (!formWrapper) {
      // Если нет обертки, показываем alert
      alert('Oops! Something went wrong while submitting the form.');
      return;
    }
    
    const successMsg = formWrapper.querySelector('.w-form-done, .success-message, .success-message-2');
    const errorMsg = formWrapper.querySelector('.w-form-fail, .error-message, .error-message-2');
    
    if (errorMsg) {
      errorMsg.style.display = 'block';
      // Добавляем класс для анимации Webflow
      formWrapper.classList.add('w-form-fail');
      formWrapper.classList.remove('w-form-done');
    }
    
    if (successMsg) {
      successMsg.style.display = 'none';
    }
  }
})();

