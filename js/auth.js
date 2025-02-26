// Initialize Supabase client
const supabaseUrl = 'https://hevcihqmpdwcckyfsdrw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhldmNpaHFtcGR3Y2NreWZzZHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1ODY3MzksImV4cCI6MjA1NjE2MjczOX0.u3jtuhKrl-Z6uYZ6VclBPnKtw1jh_ZkmJd3TyNaqv4Y';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// Helper function to show toast notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Helper function to show loading state
function setLoading(isLoading) {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = isLoading;
        submitBtn.innerHTML = isLoading ? 
            '<div class="spinner"></div>' : 
            submitBtn.getAttribute('data-text') || 'Submit';
    }
}

// Sign Up
async function signUp(email, password) {
    try {
        setLoading(true);
        const { user, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) throw error;

        showToast('Please check your email for verification link');
        setTimeout(() => window.location.href = '/pages/signin.html', 3000);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        setLoading(false);
    }
}

// Sign In
async function signIn(email, password) {
    try {
        setLoading(true);
        const { user, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        showToast('Successfully signed in');
        window.location.href = '/pages/dashboard.html';
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        setLoading(false);
    }
}

// Sign Out
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        window.location.href = '/';
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Reset Password Request
async function resetPassword(email) {
    try {
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/pages/update-password.html',
        });

        if (error) throw error;

        showToast('Password reset link sent to your email');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        setLoading(false);
    }
}

// Update Password
async function updatePassword(newPassword) {
    try {
        setLoading(true);
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        showToast('Password updated successfully');
        setTimeout(() => window.location.href = '/pages/signin.html', 2000);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        setLoading(false);
    }
}

// Check Authentication Status
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user && !window.location.pathname.includes('/signin.html') && 
        !window.location.pathname.includes('/signup.html') &&
        !window.location.pathname.includes('/reset-password.html')) {
        window.location.href = '/pages/signin.html';
    }
    return user;
}

// Event Listeners for Forms
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;

    // Sign Up Form
    if (currentPage.includes('signup.html')) {
        const form = document.querySelector('#signup-form');
        const passwordError = document.querySelector('#password-error');
        
        // Add password validation on input
        const confirmPassword = document.querySelector('#confirm-password');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => {
                const password = form.password.value;
                const confirmValue = confirmPassword.value;
                
                if (password !== confirmValue) {
                    passwordError.classList.remove('hidden');
                    confirmPassword.setCustomValidity('Passwords do not match');
                } else {
                    passwordError.classList.add('hidden');
                    confirmPassword.setCustomValidity('');
                }
            });
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = form.email.value;
                const password = form.password.value;
                const confirmValue = form.querySelector('#confirm-password').value;

                // Validate password match
                if (password !== confirmValue) {
                    passwordError.classList.remove('hidden');
                    return;
                }

                // Validate password length
                if (password.length < 6) {
                    showToast('Password must be at least 6 characters long', 'error');
                    return;
                }

                await signUp(email, password);
            });
        }
    }

    // Sign In Form
    if (currentPage.includes('signin.html')) {
        const form = document.querySelector('#signin-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = form.email.value;
                const password = form.password.value;
                await signIn(email, password);
            });
        }
    }

    // Reset Password Form
    if (currentPage.includes('reset-password.html')) {
        const form = document.querySelector('#reset-password-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = form.email.value;
                await resetPassword(email);
            });
        }
    }

    // Update Password Form
    if (currentPage.includes('update-password.html')) {
        const form = document.querySelector('#update-password-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const password = form.password.value;
                await updatePassword(password);
            });
        }
    }

    // Sign Out Button
    const signOutBtn = document.querySelector('#sign-out-btn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', signOut);
    }

    // Check authentication status on protected pages
    if (!currentPage.includes('/signin.html') && 
        !currentPage.includes('/signup.html') && 
        !currentPage.includes('/reset-password.html')) {
        checkAuth();
    }
});
