import models from '../models';
import buildFormObj from '../lib/formObjectBuilder';

export default (router) => {
  router
    .get('tasks', '/tasks', async (ctx) => {
      const userIdsession = ctx.session.userId;
      if (!userIdsession) {
        ctx.flash.set('You need to autenticate!');
        ctx.redirect('/');
        return;
      }

      console.log('in Get /tasks');
      const tasks = await models.Task.findAll({ include: ['status', 'creator'] });

      ctx.render('tasks', { tasks });
    })
    .get('newTask', '/tasks/new', async (ctx) => {
      console.log('In newTask');
      const userIdsession = ctx.session.userId;
      if (!userIdsession) {
        ctx.flash.set('You need to autenticate!');
        ctx.redirect('/');
        return;
      }
      const task = models.Task.build();
      ctx.render('tasks/new', { f: buildFormObj(task) });
    })
    .post('tasks', '/tasks', async (ctx) => {
      const userIdsession = ctx.session.userId;
      if (!userIdsession) {
        ctx.flash.set('You need to autenticate!');
        ctx.redirect('/');
        return;
      }
      const { request: { body: { form } } } = ctx;
      console.log(`body data: ${JSON.stringify(form)}`);
      const task = models.Task.build(form);
      const user = await models.User.findOne({ where: { id: userIdsession } });
      try {
        task.setCreator(user);
        console.log('Task build: ', JSON.stringify(task));
      } catch (e) {
        console.log('Set creator error: ', e);
      }
      const [statusNew, created] = await models.TaskStatus.findOrCreate({ where: { name: 'New' } });
      console.log('Satus new created: ', created);
      try {
        task.setStatus(statusNew);
      } catch (e) {
        console.log('Set status error: ', e);
      }
      try {
        await task.save();
        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        console.log('Error new Task: ', e);
        ctx.render('tasks/new', { f: buildFormObj(task, e) });
      }
    });
};
