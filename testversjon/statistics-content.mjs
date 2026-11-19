export const statisticsTranslations = {
 'Personvern og bruksstatistikk':['Privacy and usage statistics','Prywatność i statystyki użytkowania','Конфіденційність і статистика використання','Datenschutz und Nutzungsstatistik','Privacidad y estadísticas de uso'],
 'GoatCounter teller besøk, trafikkilder og apphendelser uten sporingskapsler. Nettleser og IP-adresse behandles for telling; ifølge tjenesten lagres ikke IP-adressen i databasen. Data lagres i Finland og Tyskland.':[
 'GoatCounter counts visits, traffic sources and app events without tracking cookies. Browser information and IP addresses are processed for counting; the service states that IP addresses are not stored in its database. Data is stored in Finland and Germany.',
 'GoatCounter zlicza wizyty, źródła ruchu i zdarzenia aplikacji bez śledzących plików cookie. Dane przeglądarki i adres IP są przetwarzane do zliczania; według usługodawcy adres IP nie jest zapisywany w bazie danych. Dane są przechowywane w Finlandii i Niemczech.',
 'GoatCounter рахує відвідування, джерела трафіку й події застосунку без файлів cookie для відстеження. Дані браузера та IP-адреса обробляються для підрахунку; за даними сервісу, IP-адреса не зберігається в базі даних. Дані зберігаються у Фінляндії та Німеччині.',
 'GoatCounter zählt Besuche, Zugriffsquellen und App-Ereignisse ohne Tracking-Cookies. Browserdaten und IP-Adressen werden zur Zählung verarbeitet; laut Anbieter werden IP-Adressen nicht in der Datenbank gespeichert. Die Daten werden in Finnland und Deutschland gespeichert.',
 'GoatCounter cuenta visitas, fuentes de tráfico y eventos de la aplicación sin cookies de seguimiento. Procesa datos del navegador y direcciones IP para el recuento; el servicio indica que no guarda las direcciones IP en su base de datos. Los datos se almacenan en Finlandia y Alemania.'
 ],
 'Måleverdier sendes ikke. Sist registrerte appversjon og statistikkvalget lagres lokalt. Do Not Track og Global Privacy Control respekteres.':[
 'Measurement values are not sent. The last recorded app version and statistics preference are stored locally. Do Not Track and Global Privacy Control are respected.',
 'Wartości pomiarów nie są wysyłane. Ostatnio zarejestrowana wersja aplikacji i ustawienie statystyk są zapisywane lokalnie. Sygnały Do Not Track i Global Privacy Control są respektowane.',
 'Значення вимірювань не надсилаються. Остання зареєстрована версія застосунку та вибір щодо статистики зберігаються локально. Сигнали Do Not Track і Global Privacy Control враховуються.',
 'Messwerte werden nicht gesendet. Die zuletzt erfasste App-Version und die Statistikeinstellung werden lokal gespeichert. Do Not Track und Global Privacy Control werden berücksichtigt.',
 'No se envían valores de mediciones. La última versión registrada y la preferencia de estadísticas se guardan localmente. Se respetan Do Not Track y Global Privacy Control.'
 ],
 'Installasjoner og oppdateringer telles bare delvis. Første registrerte bruk er ikke bevis på en oppdatering. Offlinebruk og blokkering gir manglende telling.':[
 'Installations and updates are only partially counted. First recorded use does not prove an update. Offline use and blocking cause missing counts.',
 'Instalacje i aktualizacje są zliczane tylko częściowo. Pierwsze zarejestrowane użycie nie potwierdza aktualizacji. Użycie offline i blokowanie powodują braki w statystykach.',
 'Встановлення й оновлення підраховуються лише частково. Перше зареєстроване використання не підтверджує оновлення. Робота офлайн і блокування спричиняють пропуски в статистиці.',
 'Installationen und Updates werden nur teilweise gezählt. Die erste erfasste Nutzung belegt kein Update. Offline-Nutzung und Blockierung führen zu fehlenden Zählungen.',
 'Las instalaciones y actualizaciones se cuentan parcialmente. El primer uso registrado no demuestra una actualización. El uso sin conexión y los bloqueos provocan recuentos incompletos.'
 ],
 'GoatCounters personverninformasjon':['GoatCounter privacy information','Informacje o prywatności GoatCounter','Інформація GoatCounter про конфіденційність','Datenschutzhinweise von GoatCounter','Información de privacidad de GoatCounter'],
 'Slå av bruksstatistikk':['Turn off usage statistics','Wyłącz statystyki użytkowania','Вимкнути статистику використання','Nutzungsstatistik ausschalten','Desactivar estadísticas de uso'],
 'Slå på bruksstatistikk':['Turn on usage statistics','Włącz statystyki użytkowania','Увімкнути статистику використання','Nutzungsstatistik einschalten','Activar estadísticas de uso'],
 'Vinkel med tommestokk':['Angle with a folding ruler','Kąt za pomocą miarki składanej','Кут за допомогою складаного метра','Winkel mit dem Zollstock','Ángulo con un metro plegable'],
 'Fallkalkulator':['Gradient calculator','Kalkulator nachylenia','Калькулятор ухилу','Gefällerechner','Calculadora de pendientes']
};
export const statisticsHtml = `<details id="statistics-privacy"><summary>Personvern og bruksstatistikk</summary>${Object.keys(statisticsTranslations).slice(1,4).map(text=>'<p>'+text+'</p>').join('')}<p><a href="https://www.goatcounter.com/help/privacy" target="_blank" rel="noopener noreferrer">GoatCounters personverninformasjon</a></p><button type="button" id="statistics-toggle" class="quiet" aria-pressed="true">Slå av bruksstatistikk</button></details>`;
