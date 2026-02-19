import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { router } from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'

// PrimeVue Components
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Menubar from 'primevue/menubar'
import Toolbar from 'primevue/toolbar'
import DataView from 'primevue/dataview'
import Tag from 'primevue/tag'
import Rating from 'primevue/rating'
import Carousel from 'primevue/carousel'
import Avatar from 'primevue/avatar'
import Tooltip from 'primevue/tooltip'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import Calendar from 'primevue/calendar'
import RadioButton from 'primevue/radiobutton'
import ProgressBar from 'primevue/progressbar'

const myPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        }
    }
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: myPreset,
        options: {
            prefix: 'p',
            darkModeSelector: '.dark',
            cssLayer: false
        }
    }
})

// Register components globally
app.component('Button', Button)
app.component('Card', Card)
app.component('Dialog', Dialog)
app.component('InputText', InputText)
app.component('Menubar', Menubar)
app.component('Toolbar', Toolbar)
app.component('DataView', DataView)
app.component('Tag', Tag)
app.component('Rating', Rating)
app.component('Carousel', Carousel)
app.component('Avatar', Avatar)
app.component('Dropdown', Dropdown)
app.component('Textarea', Textarea)
app.component('Message', Message)
app.component('Calendar', Calendar)
app.component('RadioButton', RadioButton)
app.component('ProgressBar', ProgressBar)

// Register directives
app.directive('tooltip', Tooltip)

app.mount('#app')