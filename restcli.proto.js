/*
 * Некоторые мысли относительно того, как должен выглядеть rest клиент. Всё таки работать с объёмным API
 * с помощью даже тех же fetch не так просто, как хотелось бы. Хотелось бы и batch, но простого batch для
 * нормально rest api не может быть, потому что следующий запрос может зависеть от предыдущего и тд.
 * В общем что бы хотелось:
 * + очень простой api и _КРАТКИЙ_, ну надоели уже эти якобы простые api, после которых даже старый добрый 
 *   xhr кажется
 *   совершенством(да да, я про убогие промисы)
 * + уметь batch с обработкой любых ошибок  
 */

/*rest('https://simple.rulezz', [
       'post', 'boxes/first', function(status){
	 if(status)
       }
     ]);*/

var ctx = service('https://simple.ruless');

ctx.get('users/admin/login', { pass : 123 }, function(res){
	  if(res.code != 200)
	    krishka();
	  ctx.token = res.body.token;
	  	  
	  ctx.ch(1).post('boxes/huha', function(res){
			   if(res.code !== 200)
			     trindez();

			   ctx.ch(1).post('boxes/huha/users/huha');
			   ctx.ch(1).post('boxes/huha/groups/huha');	  
			   ctx.ch(1).end(function(status){
					   if(status != 200)
					     zakat();
					   
					   ctx.post('boxes/huha/rights/huha', { access : 'rwx' }, function(res){
						      if(status == 200)
							console.log('account is created, FUF');
						    });
					 });
			 });
	});
