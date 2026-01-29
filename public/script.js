function initRouter(){
	const routes = {
 		'': 'view-home',
 		'#': 'view-home',
 		'#home': 'view-home',
 		'#login': 'view-login',
 		'#cadastro': 'view-cadastro'
 	};

 	function showView(id){
 		document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
 		const el = document.getElementById(id);
 		if(el) el.style.display = '';
 	}

 	function updateActiveNav(hash){
 		document.querySelectorAll('#nav-menu a').forEach(a => {
 			const href = a.getAttribute('href');
 			const active = href === hash || (href === '#home' && (hash === '' || hash === '#'));
 			a.classList.toggle('active', active);
 		});
 	}

 	function router(){
 		const hash = window.location.hash || '#home';
 		const view = routes[hash] || 'view-home';
 		showView(view);
 		updateActiveNav(hash);
 	}

 	window.addEventListener('hashchange', router);
 	window.addEventListener('DOMContentLoaded', () => {
 		router();
 	});
}

initRouter();
