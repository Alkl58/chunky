import { createRouter, createWebHistory } from 'vue-router';
import AdminView from '../views/Admin.vue';
import UploadView from '../views/Upload.vue';
import BucketView from '../views/Bucket.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'upload',
      component: UploadView
    },
    {
      path: '/bucket/:bucketId',
      name: 'bucket',
      component: BucketView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView
    },
  ]
})

export default router