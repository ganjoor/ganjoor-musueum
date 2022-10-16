import HomePage from './old-components/HomePage.vue';
import Items from './old-components/Items.vue';
import Artifact from './old-components/Artifact.vue';
import ArtifactItem from './old-components/ArtifactItem.vue';
import Tag from './old-components/Tag.vue';
import TagValue from './old-components/TagValue.vue';
import Search from './old-components/Search.vue';
import SignUp from './old-components/SignUp.vue';
import ForgotPassword from './old-components/ForgotPassword.vue';
import Users from './old-components/Users.vue';
import Roles from './old-components/Roles.vue';
import Profile from './old-components/Profile.vue';
import Bookmarks from './old-components/Bookmarks.vue';
import UserNotes from './old-components/UserNotes.vue';
import AllPublicNotes from './old-components/AllPublicNotes.vue';
import GanjoorFrame from './old-components/GanjoorFrame.vue';
import GanjoorLinks from './old-components/GanjoorLinks.vue';
import Notifications from './old-components/Notifications.vue';
import Events from './old-components/Events.vue';
import PinterestLinks from './old-components/PinterestLinks.vue';
import MixUtils from './old-components/MixUtils.vue';
import ReportedNotes from './old-components/ReportedNotes.vue';

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
        path: '/search',
        component: Search
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