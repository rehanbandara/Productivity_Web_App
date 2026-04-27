package com.smartcampus.smart_campus_api.config;

import com.smartcampus.smart_campus_api.model.Role;
import com.smartcampus.smart_campus_api.model.User;
import com.smartcampus.smart_campus_api.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.util.Set;

@Component // Spring will detect and use this handler
@RequiredArgsConstructor // Injects userRepository and jwtUtil
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository; // Access user data
    private final JwtUtil jwtUtil; // Generate JWT token

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        // Get user info from OAuth provider (Google)
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        // Extract user details from Google
        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String picture = oauthUser.getAttribute("picture");

        // Check if user already exists in DB
        // If NOT → create new user
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .name(name)
                    .profilePicture(picture)
                    .provider("google") // mark login provider
                    .roles(Set.of(Role.USER)) // default role
                    .enabled(true)
                    .build();
            return userRepository.save(newUser); // save new user
        });

        // Get user role (take first role)
        String role = user.getRoles().iterator().next().name();

        // Generate JWT token for this user
        String token = jwtUtil.generateToken(email, role, user.getId());

        // Build redirect URL to frontend
        String redirectUrl = "http://localhost:5173/oauth-callback"
                + "?token=" + token
                + "&role=" + role
                + "&userId=" + user.getId()
                + "&name=" + java.net.URLEncoder.encode(name, "UTF-8");

        // Redirect user to frontend with token and user info
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}














/*

After successful Google login, this handler extracts user details, checks if the user 
exists in the database, creates a new user if needed, generates a JWT token, and redirects 
the user to the frontend with authentication details.

*/