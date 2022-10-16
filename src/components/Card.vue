<!-- 
<template>
  <router-link :to="`${url}`">
    <div class="w-full max-w-xs overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <img class="object-cover w-full h-56" :src="`${img}`" alt="avatar">

      <div class="py-5 text-center">
        <a href="#" class="block text-1xl font-bold text-gray-800 dark:text-white" tabindex="0" role="link">
          {{name.substring(0, name.indexOf('اثر'))}}
        </a>
        <span class="text-sm text-gray-700 dark:text-gray-200">
          {{name.substring(name.lastIndexOf('اثر', name.length))}}...
        </span>
        <p>
          <small>
            {{formatDate(time)}}
          </small>
        </p>
      </div>
    </div>
  </router-link>
</template> -->
<template>
  <a href="#" class="block overflow-hidden rounded-2xl">
    <img alt="Office" :src="`${img}`" class="h-56 w-full object-cover" />

    <div class="bg-gray-900 p-4">
      <p class="text-xs text-gray-500">{{formatDate(time)}}</p>

      <h3 class="text-sm text-white">
        {{name.substring(0, name.indexOf('اثر'))}}
      </h3>

      <p class="mt-1 text-xs text-gray-500">
        {{name.substring(name.lastIndexOf('اثر', name.length))}}...
      </p>
    </div>
  </a>

</template>
<script>

export default {
  name: 'Card',
  props: {
    name: String,
    desc: String,
    img: String,
    url: String,
    time: String
  },
  methods: {
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(date).toLocaleDateString('fa', options)
    },
  }
}
</script>