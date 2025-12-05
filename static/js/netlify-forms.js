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
  
  // Функция для отключения Webflow обработки формы
  // ВАЖНО: НЕ удаляем классы w-form, w-checkbox, w-input и т.д. - они нужны для CSS стилей!
  // Удаляем только обработчики событий и data-атрибуты, которые используются для JS обработки
  function disableWebflowForm(form) {
    try {
      // Удаляем все обработчики событий от Webflow
      if (form._wForm) {
        try {
          delete form._wForm;
        } catch(e) {}
      }
      
      // НЕ удаляем классы w-form, w-checkbox, w-input и т.д. - они нужны для CSS стилей!
      // Удаляем только data-атрибуты Webflow, которые используются для JS обработки
      form.removeAttribute('data-wf-page-id');
      form.removeAttribute('data-wf-element-id');
      
      // Убеждаемся, что форма имеет правильный action
      if (!form.getAttribute('action')) {
        form.setAttribute('action', window.location.pathname || '/');
      }
      
      // Все классы остаются нетронутыми - они нужны для стилей Webflow
    } catch(e) {
      console.error('Error disabling Webflow form:', e);
    }
  }
  
  // Перехватываем событие submit ДО всех других обработчиков
  // Используем самую раннюю фазу захвата
  var submitHandler = function(event) {
    try {
      var form = event.target;
      
      console.log('Netlify Forms: Submit event detected on', form ? (form.name || form.id || form.tagName) : 'unknown');
      
      // Проверяем, что это форма
      if (form && form.tagName === 'FORM') {
        // Проверяем наличие data-netlify (может быть "true" или просто атрибут)
        var hasNetlify = form.hasAttribute('data-netlify');
        var netlifyValue = form.getAttribute('data-netlify');
        
        // Также проверяем по имени формы (fallback)
        var isKnownForm = form.name === 'contact' || 
                         form.name === 'contact-section' || 
                         form.name === 'newsletter';
        
        if (hasNetlify || isKnownForm) {
          // Если атрибут отсутствует, но это известная форма, добавляем его
          if (!hasNetlify && isKnownForm) {
            console.log('Netlify Forms: Adding data-netlify="true" to form', form.name);
            form.setAttribute('data-netlify', 'true');
          }
          
          console.log('%cNetlify Forms: Intercepted form submission', 'color: blue; font-weight: bold;', form.name || form.id || 'unnamed');
          
          // Полностью останавливаем распространение события
          event.stopImmediatePropagation();
          event.stopPropagation();
          
          // Отключаем Webflow обработку (сохраняем все классы для стилей)
          disableWebflowForm(form);
          
          // НЕ вызываем preventDefault() - позволяем стандартную отправку
          // Форма отправится стандартным HTML способом на Netlify
          
          var action = form.getAttribute('action') || window.location.pathname || '/';
          console.log('Netlify Forms: Form will submit to', action);
          
          // Возвращаем true чтобы форма отправилась
          return true;
        } else {
          console.log('Netlify Forms: Form does not have data-netlify, allowing normal submission');
        }
      }
    } catch(e) {
      console.error('Error in submit handler:', e);
    }
  };
  
  // Добавляем обработчик в capture phase (самая ранняя фаза)
  document.addEventListener('submit', submitHandler, true);
  
  // Защита от удаления атрибута data-netlify
  // Используем MutationObserver для отслеживания изменений форм
  function protectNetlifyForms() {
    try {
      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-netlify') {
            var target = mutation.target;
            if (target.tagName === 'FORM') {
              var isKnownForm = target.name === 'contact' || 
                               target.name === 'contact-section' || 
                               target.name === 'newsletter';
              
              // Если атрибут был удален, восстанавливаем его
              if (!target.hasAttribute('data-netlify') && isKnownForm) {
                console.warn('Netlify Forms: data-netlify attribute was removed from form', target.name, '- restoring it');
                target.setAttribute('data-netlify', 'true');
              }
            }
          }
          
          // Также проверяем, если форма была изменена другим способом
          if (mutation.type === 'childList' || mutation.type === 'attributes') {
            var forms = document.querySelectorAll('form[name="contact"], form[name="contact-section"], form[name="newsletter"]');
            forms.forEach(function(form) {
              if (!form.hasAttribute('data-netlify')) {
                console.log('Netlify Forms: Restoring data-netlify for form', form.name);
                form.setAttribute('data-netlify', 'true');
              }
            });
          }
        });
      });
      
      // Наблюдаем за всеми формами
      var forms = document.querySelectorAll('form');
      forms.forEach(function(form) {
        observer.observe(form, {
          attributes: true,
          attributeFilter: ['data-netlify', 'action', 'method'],
          childList: false,
          subtree: false
        });
      });
      
      console.log('Netlify Forms: MutationObserver set up to protect forms');
    } catch(e) {
      console.warn('Netlify Forms: MutationObserver not supported:', e);
    }
  }
  
  // Инициализируем после загрузки DOM
  function initNetlifyForms() {
    try {
      // Ищем все формы на странице для отладки
      var allForms = document.querySelectorAll('form');
      console.log('Netlify Forms: Total forms on page:', allForms.length);
      
      // Выводим информацию о всех формах
      allForms.forEach(function(form, index) {
        var hasNetlify = form.hasAttribute('data-netlify');
        var netlifyValue = form.getAttribute('data-netlify');
        console.log('Form #' + index + ':', {
          name: form.name || 'unnamed',
          id: form.id || 'no-id',
          hasDataNetlify: hasNetlify,
          dataNetlifyValue: netlifyValue,
          method: form.method,
          action: form.action || 'no action',
          classes: form.className
        });
      });
      
      // Ищем формы с data-netlify="true" или просто data-netlify
      var netlifyForms = document.querySelectorAll('form[data-netlify="true"], form[data-netlify]');
      console.log('Netlify Forms: Found', netlifyForms.length, 'form(s) with data-netlify attribute');
      
      if (netlifyForms.length === 0) {
        console.warn('Netlify Forms: No forms found with data-netlify!');
        console.warn('Netlify Forms: Trying to find forms by name...');
        
        // Пробуем найти формы по имени
        var contactForm = document.querySelector('form[name="contact"]');
        var contactSectionForm = document.querySelector('form[name="contact-section"]');
        var newsletterForm = document.querySelector('form[name="newsletter"]');
        
        if (contactForm) {
          console.log('Found form[name="contact"], adding data-netlify="true"');
          contactForm.setAttribute('data-netlify', 'true');
          netlifyForms = document.querySelectorAll('form[data-netlify]');
        }
        if (contactSectionForm) {
          console.log('Found form[name="contact-section"], adding data-netlify="true"');
          contactSectionForm.setAttribute('data-netlify', 'true');
          netlifyForms = document.querySelectorAll('form[data-netlify]');
        }
        if (newsletterForm) {
          console.log('Found form[name="newsletter"], adding data-netlify="true"');
          newsletterForm.setAttribute('data-netlify', 'true');
          netlifyForms = document.querySelectorAll('form[data-netlify]');
        }
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
    document.addEventListener('DOMContentLoaded', function() {
      initNetlifyForms();
      protectNetlifyForms();
    });
  } else {
    // DOM уже загружен, инициализируем сразу
    initNetlifyForms();
    protectNetlifyForms();
  }
  
  // Также пробуем инициализировать через небольшую задержку на случай если DOM еще не готов
  setTimeout(function() {
    initNetlifyForms();
    protectNetlifyForms();
  }, 100);
  
  // Защита после загрузки Webflow JS (если он загружается позже)
  setTimeout(function() {
    initNetlifyForms();
    protectNetlifyForms();
  }, 1000);
  
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

