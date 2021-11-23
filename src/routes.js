import HomePage from './components/HomePage.vue';
import Items from './components/Items.vue';
import Artifact from './components/Artifact.vue';
import ArtifactItem from './components/ArtifactItem.vue';
import Tag from './components/Tag.vue';
import TagValue from './components/TagValue.vue';
import SignUp from './components/SignUp.vue';
import ForgotPassword from './components/ForgotPassword.vue';
import Users from './components/Users.vue';
import Roles from './components/Roles.vue';
import Profile from './components/Profile.vue';
import Bookmarks from './components/Bookmarks.vue';
import UserNotes from './components/UserNotes.vue';
import AllPublicNotes from './components/AllPublicNotes.vue';
import GanjoorFrame from './components/GanjoorFrame.vue';
import GanjoorLinks from './components/GanjoorLinks.vue';
import Notifications from './components/Notifications.vue';
import Events from './components/Events.vue';
import PinterestLinks from './components/PinterestLinks.vue';
import MixUtils from './components/MixUtils.vue';
import ReportedNotes from './components/ReportedNotes.vue';

export const routes = [
    {
        path: '/',
        component: HomePage
    },
    {
        path: '/items',
        component: Items
    },
    {
        path: '/items/pageno/:pageno',
        component: Items
    },
    {
        path: '/signup',
        component: SignUp
    },
    {
        path: '/forgot-password',
        component: ForgotPassword
    },
    {
        path: '/users',
        component: Users
    },
    {
        path: '/roles',
        component: Roles
    },
    {
        path: '/profile',
        component: Profile
    },
    {
        path: '/bookmarks',
        component: Bookmarks
    },
    {
        path: '/bookmarks/pageno/:pageno',
        component: Bookmarks
    },
    {
        path: '/mynotes/type/:type',
        component: UserNotes
    },
    {
        path: '/mynotes/type/:type/pageno/:pageno',
        component: UserNotes
    },
    {
        path: '/notes',
        component: AllPublicNotes
    },
    {
        path: '/notes/pageno/:pageno',
        component: AllPublicNotes
    },
    {
        path: '/items/:friendlyUrl',
        component: Artifact
    },
    {
        path: '/items/:friendlyUrl/tags/:tag',
        component: Artifact
    },
    {
        path: '/items/:friendlyUrl/tags/:tag/:value',
        component: Artifact
    },
    {
        path: '/items/:friendlyUrl/pageno/:pageno',
        component: Artifact
    },
    {
        path: '/items/:friendlyUrl/:pageUrl',
        component: ArtifactItem
    },
    {
        path: '/tags/:friendlyUrl',
        component: Tag
    },
    {
        path: '/tags/:friendlyUrl/:valueUrl',
        component: TagValue
    },
    {
        path: '/ganjoor',
        component: GanjoorFrame
    },
    {
        path: '/glinkrev',
        component: GanjoorLinks
    },
    {
        path: '/notifications',
        component: Notifications
    },
    {
        path: '/logs',
        component: Events
    },
    {
        path: '/plinkrev',
        component: PinterestLinks
    },
    {
        path: '/utils',
        component: MixUtils
    },
    {
        path: '/reported',
        component: ReportedNotes
    },
]