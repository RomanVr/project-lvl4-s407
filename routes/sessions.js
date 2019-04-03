import buildFormObj from '../lib/formObjectBuilder';
import { encrypt } from '../lib/secure';
import models from '../models';

export default (router) => {
  router
    .get('newSession', '/session/new', async (ctx) => {
      const data = {};
      ctx.render('sessions/new', { f: buildFormObj(data) });
    })
    .post('session', '/session', async (ctx) => {
      console.log('In post session');
      const { email, password } = ctx.request.body.form;
      const user = await models.User.findOne({
        where: {
          email,
        },
      });
      console.log(`Register user: ${JSON.stringify(user)}`);
      if (user && user.passwordDigest === encrypt(password)) {
        ctx.session.userId = user.id;
        ctx.redirect(router.url('root'));
        return;
      }

      // flash
      ctx.render('sessions/new', { f: buildFormObj({ email }) });
    })
    .delete('session', '/session', (ctx) => {
      ctx.session = {};
      ctx.redirect(router.url('root'));
    });
};