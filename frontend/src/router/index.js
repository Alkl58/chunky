import { createRouter, createWebHistory } from 'vue-router';
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
    }
  ]
})

export default router