// Netlify Forms Handler
// Полностью отключает Webflow JS обработку для форм с data-netlify="true"
// Позволяет формам отправляться стандартным способом, как в оригинальном boilerplate

(function() {
  'use strict';
  
  // Принудительно выводим сообщение о загрузке скрипта
  try {
    console.log('%cNetlify Forms Handler', 'color: green; font-weight: bold; font-size: 14px;');
    console.log('Script loaded and executing...');
  } catch(e) {
    // Если console.log не работает, пробуем alert
    if (typeof alert !== 'undefined') {
      alert('Netlify Forms Handler: Script loaded');
    }
  }
  
  // Функция для полного отключения Webflow обработки формы
  function disableWebflowForm(form) {
    try {
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
        form.setAttribute('action', window.location.pathname || '/');
      }
    } catch(e) {
      console.error('Error disabling Webflow form:', e);
    }
  }
  
  // Перехватываем событие submit ДО всех других обработчиков
  // Используем самую раннюю фазу захвата
  var submitHandler = function(event) {
    try {
      var form = event.target;
      
      // Проверяем, что это форма с data-netlify="true"
      if (form && form.tagName === 'FORM' && form.hasAttribute('data-netlify')) {
        console.log('%cNetlify Forms: Intercepted form submission', 'color: blue; font-weight: bold;', form.name || form.id || 'unnamed');
        
        // Полностью останавливаем распространение события
        event.stopImmediatePropagation();
        event.stopPropagation();
        
        // Отключаем Webflow обработку
        disableWebflowForm(form);
        
        // НЕ вызываем preventDefault() - позволяем стандартную отправку
        // Форма отправится стандартным HTML способом на Netlify
        
        var action = form.getAttribute('action') || window.location.pathname || '/';
        console.log('Netlify Forms: Form will submit to', action);
        
        // Возвращаем true чтобы форма отправилась
        return true;
      }
    } catch(e) {
      console.error('Error in submit handler:', e);
    }
  };
  
  // Добавляем обработчик в capture phase (самая ранняя фаза)
  document.addEventListener('submit', submitHandler, true);
  
  // Инициализируем после загрузки DOM
  function initNetlifyForms() {
    try {
      var netlifyForms = document.querySelectorAll('form[data-netlify="true"]');
      console.log('Netlify Forms: Found', netlifyForms.length, 'form(s) with data-netlify="true"');
      
      if (netlifyForms.length === 0) {
        console.warn('Netlify Forms: No forms found! Check that forms have data-netlify="true" attribute.');
      }
      
      netlifyForms.forEach(function(form) {
        // Отключаем Webflow обработку для всех найденных форм
        disableWebflowForm(form);
        
        // Убеждаемся, что action установлен
        if (!form.getAttribute('action')) {
          form.setAttribute('action', window.location.pathname || '/');
        }
        
        console.log('Netlify Forms: Configured form', form.name || form.id || 'unnamed', '->', form.getAttribute('action'));
      });
    } catch(e) {
      console.error('Error initializing Netlify forms:', e);
    }
  }
  
  // Инициализируем сразу и после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNetlifyForms);
  } else {
    // DOM уже загружен, инициализируем сразу
    initNetlifyForms();
  }
  
  // Также пробуем инициализировать через небольшую задержку на случай если DOM еще не готов
  setTimeout(initNetlifyForms, 100);
  
  // Обработка успешной отправки (Netlify добавляет ?success=true в URL)
  if (window.location.search.includes('success=true')) {
    setTimeout(function() {
      try {
        var forms = document.querySelectorAll('form[data-netlify="true"]');
        forms.forEach(function(form) {
          var formWrapper = form.closest('.w-form') || form.parentElement;
          if (formWrapper) {
            var successMsg = formWrapper.querySelector('.w-form-done, .success-message, .success-message-2');
            if (successMsg) {
              successMsg.style.display = 'block';
              formWrapper.classList.add('w-form-done');
              successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
        });
      } catch(e) {
        console.error('Error showing success message:', e);
      }
    }, 100);
  }
  
  console.log('%cNetlify Forms handler initialized successfully', 'color: green; font-weight: bold;');
})();

