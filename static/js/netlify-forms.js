// Netlify Forms Handler
// Полностью отключает Webflow JS обработку для форм с data-netlify="true"
// Позволяет формам отправляться стандартным способом, как в оригинальном boilerplate

(function() {
  'use strict';
  
  // Функция для полного отключения Webflow обработки формы
  function disableWebflowForm(form) {
    // Удаляем все обработчики событий от Webflow
    if (form._wForm) {
      try {
        delete form._wForm;
      } catch(e) {}
    }
    
    // Удаляем классы, которые Webflow использует для обработки
    form.classList.remove('w-form');
    const wrapper = form.closest('.w-form');
    if (wrapper) {
      wrapper.classList.remove('w-form');
    }
    
    // Удаляем data-атрибуты Webflow
    form.removeAttribute('data-wf-page-id');
    form.removeAttribute('data-wf-element-id');
    
    // Убеждаемся, что форма имеет правильный action
    if (!form.getAttribute('action')) {
      form.setAttribute('action', window.location.pathname);
    }
  }
  
  // Перехватываем событие submit ДО всех других обработчиков
  document.addEventListener('submit', function(event) {
    const form = event.target;
    
    // Проверяем, что это форма с data-netlify="true"
    if (form && form.tagName === 'FORM' && form.hasAttribute('data-netlify')) {
      console.log('Netlify Forms: Intercepted form', form.name || form.id);
      
      // Полностью останавливаем распространение события
      event.stopImmediatePropagation();
      event.stopPropagation();
      
      // Отключаем Webflow обработку
      disableWebflowForm(form);
      
      // НЕ вызываем preventDefault() - позволяем стандартную отправку
      // Форма отправится стандартным HTML способом на Netlify
      
      console.log('Netlify Forms: Form will submit to', form.action || window.location.pathname);
    }
  }, true); // capture phase - перехватываем раньше всех
  
  // Инициализируем после загрузки DOM
  function initNetlifyForms() {
    const netlifyForms = document.querySelectorAll('form[data-netlify="true"]');
    console.log('Netlify Forms: Found', netlifyForms.length, 'forms');
    
    netlifyForms.forEach(function(form) {
      // Отключаем Webflow обработку для всех найденных форм
      disableWebflowForm(form);
      
      // Убеждаемся, что action установлен
      if (!form.getAttribute('action')) {
        form.setAttribute('action', window.location.pathname);
      }
      
      console.log('Netlify Forms: Configured form', form.name || form.id, '->', form.action);
    });
  }
  
  // Инициализируем сразу и после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNetlifyForms);
  } else {
    initNetlifyForms();
  }
  
  // Обработка успешной отправки (Netlify добавляет ?success=true в URL)
  if (window.location.search.includes('success=true')) {
    setTimeout(function() {
      const forms = document.querySelectorAll('form[data-netlify="true"]');
      forms.forEach(function(form) {
        const formWrapper = form.closest('.w-form') || form.parentElement;
        if (formWrapper) {
          const successMsg = formWrapper.querySelector('.w-form-done, .success-message, .success-message-2');
          if (successMsg) {
            successMsg.style.display = 'block';
            formWrapper.classList.add('w-form-done');
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      });
    }, 100);
  }
  
  console.log('Netlify Forms handler initialized');
})();

