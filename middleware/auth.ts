export default defineNuxtRouteMiddleware((to, _from) => {
  const user = useSupabaseUser();
  const redirectCookie = useCookie<string | null>('redirect');

  if (!user.value) {
    redirectCookie.value = to.fullPath;
    return navigateTo('/sign-in');
  }
});
