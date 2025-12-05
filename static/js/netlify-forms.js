// Netlify Forms Handler
// Предотвращает перехват форм Webflow JS и позволяет Netlify обрабатывать их стандартным способом
// Если нужна AJAX отправка, можно раскомментировать соответствующий код

(function() {
  // Отключаем перехват форм Webflow JS для форм с data-netlify="true"
  // Используем capture phase чтобы перехватить событие раньше Webflow
  document.addEventListener('submit', function(event) {
    const form = event.target;
    // Проверяем, что это форма с data-netlify="true"
    if (form && form.tagName === 'FORM' && form.hasAttribute('data-netlify')) {
      console.log('Netlify Forms: Allowing standard submission for', form.name || form.id);
      // Останавливаем распространение события, чтобы Webflow JS не перехватил форму
      event.stopPropagation();
      event.stopImmediatePropagation();
      // НЕ вызываем preventDefault() - позволяем форме отправиться стандартным способом
      // Netlify автоматически обработает форму на сервере
    }
  }, true); // true = capture phase, перехватываем раньше других
  
  console.log('Netlify Forms handler initialized - using standard form submission');

  // Также инициализируем после загрузки DOM для форм, которые могут быть добавлены динамически
  function initNetlifyForms() {
    const netlifyForms = document.querySelectorAll('form[data-netlify="true"]');
    console.log('Netlify Forms: Found', netlifyForms.length, 'forms with data-netlify="true"');
    
    netlifyForms.forEach(function(form) {
      // Убеждаемся, что форма еще не обрабатывается
      if (!form.hasAttribute('data-netlify-handled')) {
        form.setAttribute('data-netlify-handled', 'true');
        console.log('Netlify Forms: Registered form', form.name || form.id);
        
        // Убираем обработчики Webflow, если они есть
        // Webflow обычно добавляет обработчики через jQuery
        if (typeof jQuery !== 'undefined' && jQuery.fn && jQuery.fn.wForm) {
          try {
            // Отключаем Webflow обработку для этой формы
            form.classList.remove('w-form');
            const wrapper = form.closest('.w-form');
            if (wrapper) {
              wrapper.classList.remove('w-form');
            }
          } catch(e) {
            console.warn('Could not disable Webflow form handler:', e);
          }
        }
      }
    });
  }

  // Инициализируем после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNetlifyForms);
  } else {
    initNetlifyForms();
  }
  
  // Формы отправляются стандартным способом (как в оригинальном boilerplate)
  // Netlify автоматически обработает их на сервере
  // После успешной отправки Netlify перенаправит на страницу с параметром ?success=true
  // Можно добавить обработку этого параметра для показа сообщения об успехе
  
  // Проверяем URL на наличие параметра успешной отправки
  if (window.location.search.includes('success=true')) {
    const forms = document.querySelectorAll('form[data-netlify="true"]');
    forms.forEach(function(form) {
      const formWrapper = form.closest('.w-form');
      if (formWrapper) {
        const successMsg = formWrapper.querySelector('.w-form-done, .success-message, .success-message-2');
        if (successMsg) {
          successMsg.style.display = 'block';
          formWrapper.classList.add('w-form-done');
          // Прокручиваем к сообщению
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    });
  }
})();

