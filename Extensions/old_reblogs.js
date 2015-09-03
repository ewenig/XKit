//* TITLE Restore Old Reblogs **//
//* VERSION 1.2.1 **//
//* DESCRIPTION	Restores the old reblogging style on the Dashboard **//
//* DEVELOPER eli <eli@csh.rit.edu> (forked from Editable Reblogs by dlmarquis) **//
//* FRAME false **//
//* BETA false **//

XKit.extensions.old_reblogs = new Object({

	running: false,

	run: function() {
		this.running = true;

		XKit.post_listener.add("old_reblogs", XKit.extensions.old_reblogs.main);
		XKit.tools.add_css('.xkit-old-reblogs-done div.reblog-list { display: none }','xkit_old_reblogs_remove_reblog_list');
		XKit.tools.add_css('.xkit-old-reblogs-done div.contributed-content { display: none }','xkit_old_reblogs_remove_reblog_content');
		XKit.tools.add_css('.post_media { margin-bottom: 15px !important }','xkit_old_reblogs_fix_post_spacing');
		XKit.extensions.old_reblogs.main();
	},

	main: function() {
		var posts = XKit.interface.get_posts('xkit-old-reblogs-done', false);

		if (posts.length <= 0) {
			// no posts
			return;
		}

		$(posts).each(function() {
			// get the reblog-list for the post
			var reblog_chain = $(this).find('div.reblog-list');
			// get the text that the user added to the post (might not exist but it's
			// sanity checked later)
			var reblog_text = $(this).find('div.contributed-content > div.reblog-content').html();
			// get the title of the post (only necessary if it was reblogged)
			var title_text = $(this).find('div.reblog-title').html();

			// Guard against double evaluation by marking the tree as processed
			var processed_class = 'xkit-old-reblogs-done';
			if ($(this).hasClass(processed_class)) {
				return;
			}
			$(this).addClass(processed_class);

			var users_chain = reblog_chain.find('.reblog-tumblelog-name');
			var content_chain = reblog_chain.find('div.reblog-content');

			// the tag we will insert the new post content into
			var post_entrypoint = $(this).find('.post_content_inner');

			if (typeof(title_text) !== 'undefined') {
				// append the title of the post
				post_entrypoint.append(
					$(document.createElement('div')).addClass('post_title xkit-old-reblogs-new').html(title_text)
				);
			}

			// (re)construct the post, starting from the list of usernames in the reblog list and working backwards
			var post_body = $(document.createElement('div')).addClass('post_body xkit-old-reblogs-new');
			var body_content = "";
			$(users_chain.get().reverse()).each(function() {
				var user_link = $(this).attr('href');
				if (typeof(user_link) === 'undefined') {
					// user is deactivated
					body_content += '<p><a class="tumblr_blog" title="deactivated">';
				} else {
					body_content += '<p><a class="tumblr_blog" href="' + user_link + '">';
				}
				// thanks: http://stackoverflow.com/a/8506972
				body_content += $(this).contents().get(0).nodeValue + '</a>:<blockquote>';
			});
			content_chain.each(function() {
				body_content += $(this).html();
				body_content += '</blockquote></p>';
			});
			if (typeof(reblog_text) !== "undefined") {
				// add the user's reblog text to the bottom
				body_content += '<p>';
				body_content += reblog_text;
				body_content += '</p>';
			}

			post_entrypoint.append(post_body.html(body_content));
		});
	},

	destroy: function() {
		$("div.xkit-old-reblogs-new").remove();
		$('.xkit-old-reblogs-done').each(function() {
			$(this).removeClass('xkit-old-reblogs-done');
		});

		this.running = false;
		XKit.tools.remove_css("xkit_old_reblogs_remove_reblog_list");
		XKit.tools.remove_css("xkit_old_reblogs_remove_reblog_content");
		XKit.tools.remove_css("xkit_old_reblogs_fix_post_spacing");
		XKit.interface.post_window_listener.remove("old_reblogs");
	}
});
