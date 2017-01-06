var siteData;
var sortable;
// var blacklist = ['vimeo.com', 'howwegettonext.com', 'google.com', 'nytimes.com', 'twitter.com', 'facebook.com', 'github.com', 'media.ccc.de'];
var blacklist = ['facebook.com'];
var whitelist = ['projects.interactiefarnhem.nl', 'docs.google.com', 'submarinecablemap.com'];
var xhr;

function extractDomain(url) {
	var domain;
	if (url.indexOf("://") > -1) {
		domain = url.split('/')[2];
	} else {
		domain = url.split('/')[0];
	}

	domain = domain.split(':')[0];

	return domain;
}

function slugify(text) {
	return text.toString().toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^\w\-]+/g, '')
		.replace(/\-\-+/g, '-')
		.replace(/^-+/, '')
		.replace(/-+$/, '');
}

$(document).ready(function() {

	// document.getElementById('backgrnd').contentDocument.designMode = 'on';

	var blackwww = [];
	for (var i=0; i<blacklist.length; i++) {
		blackwww.push('www.'+blacklist[i]);
	}
	blacklist = blacklist.concat(blackwww);

	var whitewww = [];
	for (var j=0; j<whitelist.length; j++) {
		whitewww.push('www.'+whitelist[j]);
	}
	whitelist = whitelist.concat(whitewww);

	$('form').submit(function(e) {
		e.preventDefault();

		var title = $(this).find('input[name=title]').val();
		var url = $(this).find('input[name=url]').val();

		$.ajax({
			url: 'add.php',
			method: 'post',
			type: 'json',
			data: {
				title: title,
				url: url,
			},
			success: function(data) {
				$('form').find('input[name=title]').val('');
				$('form').find('input[name=url]').val('');
				loadReader();
			},
			error: function(err) {
				console.error(err);
			}
		});
	});

	$('#edit').click(function() {
		$('body').addClass('edit');
		sortable.option("disabled", false);
	});

	$('#done').click(function() {
		$('body').removeClass('edit');
		sortable.option("disabled", true);
	});

	loadReader();

	$('#menu-toggle').click(function() {
		if ($('body').hasClass('menu-open')) {
			$('body').removeClass('menu-open');
		} else {
			$('body').addClass('menu-open');
		}
	});

	

	$('#menu-open').click(function(){
		$("#navigation").toggle();
		$("#menu").toggleClass("border");
	});

});

function loadReader() {
	var t = Math.floor(Date.now() / 1000);
	$.get( 'data/info.json?t='+t, function( data ) {
		if (typeof data == 'string') {
			data = $.parseJSON(data);
		}

		siteData = data;

		var links = $('#navigation');
		links.empty();
		for (var property in data.menu) {

			if (data.menu.hasOwnProperty(property)) {
								

				var urlsafe = slugify(property);
				var item = $('<li class="menu-item" data-id="'+property+'">');
				item.addClass(urlsafe);
				item.html('<a class="nav-link" href="#'+ property +'">'+property+'<button type="button" class="delete-btn">Delete</button></a>');

				var domain = extractDomain(siteData.menu[property]);
				if (blacklist.indexOf(domain) >= 0) {
					item.find('a').addClass('external').append(' ↗');
				}

				item.appendTo(links);
			}
		}

		$('.delete-btn').click(function(e) {
			e.preventDefault();
			if (confirm('Are you sure?')) {
				var item = $(this).parent().attr('href');
				item = item.replace('#','');
				item = decodeURI(item);
				if (data.menu.hasOwnProperty(item)) {
					$.ajax({
						url: 'remove.php',
						method: 'post',
						type: 'json',
						data: {
							item: item,
						},
						success: function(data) {
							loadReader();
						},
						error: function(err) {
							console.error(err);
						}
					});
				}
			}
		});


		$('.external').click(function(e) {
			e.preventDefault();
			if (e.target.tagName === 'A') {
				var item = $(this).attr('href');
				item = item.replace('#','');
				item = decodeURI(item);
				if (siteData.menu.hasOwnProperty(item)){
					window.open(siteData.menu[item]);
				}	
			}
		});

		locationHashChanged();

		var el = document.getElementById('navigation');
		sortable = Sortable.create(el, {
			disabled: true,
			onSort: function() {
				
				var order = sortable.toArray();
				$.ajax({
					url: 'order.php',
					method: 'post',
					type: 'json',
					data: {
						order: order,
					},
					success: function(data) {
					},
					error: function(err) {
						console.error(err);
					}

				});
			}
		});

	});
}

function loadPage(url) {
	$('#background-url').html('<a class="site-external" href="' + url + '">' + url + '</a>');
	$('.site-external').click(function(e) {
		e.preventDefault();
		window.open($(this).attr('href'));
	});

	var urlparts = url.split('.');
	var ext;
	if (urlparts.length > 0) {
		ext = urlparts.pop().toLowerCase();
	}
	
	var domain = extractDomain(url);
	console.log(domain);
	if (whitelist.indexOf(domain) >= 0 || ext === 'pdf') {
		$('#backgrnd').remove();
		$('#background-site').append('<iframe name="backgrnd" id="backgrnd" scrolling="yes" src="' + url+ '"></iframe>');
	} else {
		$('#backgrnd').remove();

		if (xhr !== undefined) {
			xhr.abort();
		}
		xhr = $.ajax({
			type: 'get',
			url: 'corsproxy.php?url='+url,
			data: {
				url: url
			},
			success: function(retval){
				var contents = $.parseHTML(retval.contents);
				var el = $('<div></div>');
				el.append(contents);
				var html = el.html();
				
				$('#background-site').append('<iframe name="backgrnd" id="backgrnd" scrolling="yes" src=""></iframe>');

				setTimeout(function() {
					$('#backgrnd').contents().find('body').empty().append(html);
				}, 100);
	
			}, 
			error: function(error) {
				console.error(error);
			}
		});
	}
}


function locationHashChanged() {
	var item = window.location.hash;

	if (item === '') {
		$('body').addClass('menu-open');
	}

	item = item.replace('#','');
	item = decodeURI(item);
	
	$('li a').removeClass('active');

	var urlsafe;
	if (siteData.menu.hasOwnProperty(item)){

		loadPage(siteData.menu[item]);
		urlsafe = slugify(item);
		$('.'+urlsafe+' a').addClass('active');
		$('body').removeClass('menu-open');
	} else {
		// $('#backgrnd').attr('src', siteData.menu[Object.keys(siteData.menu)[0]]);
		loadPage(siteData.menu[Object.keys(siteData.menu)[0]]);
		urlsafe = slugify(item);
		$('li a').first().addClass('active');
	}
}

// function iframeLoaded() {
// 	console.log('ok');
// 	go();
// 	// locationHashChanged();
// }

window.onhashchange = locationHashChanged;
// document.getElementById('backgrnd').onload = iframeLoaded;
