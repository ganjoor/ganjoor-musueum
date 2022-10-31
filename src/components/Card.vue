<template>
  <div>
    <router-link :to="`${url}`"
      class="group h-96 flex items-end bg-gray-100 rounded-lg overflow-hidden shadow-lg relative p-4">
      <img :src="`${img}`" loading="lazy" alt="Photo by Austin Wade"
        class="w-full h-full object-cover object-center absolute inset-0 group-hover:scale-110 transition duration-200" />

      <div class="w-full flex flex-col bg-white text-center rounded-lg relative p-4">
        <span class="text-gray-500">
          <small v-if="haveTime">{{ formatDate(time) }}</small>
        </span>
        <span class="text-gray-800 text-lg lg:text-l font-bold">
          {{ name.substring(0, name.indexOf('اثر')) || name }}
        </span>
      </div>
    </router-link>
  </div>
  <!-- product - end -->

</template>
<script>

export default {
  name: 'Card',
  props: {
    name: String,
    desc: String,
    img: String,
    url: String,
    time: String,
    haveTime: Boolean
  },
  methods: {
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(date).toLocaleDateString('fa', options)
    },
  }
}
</script>