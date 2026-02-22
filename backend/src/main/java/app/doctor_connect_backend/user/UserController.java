package app.doctor_connect_backend.user;


import app.doctor_connect_backend.auth.security.UserPrincipal;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/profile")
    public UserResponseDTO updateProfile(@RequestBody UserUpdateDTO dto,
                                                      @AuthenticationPrincipal UserPrincipal me
                                                      ) {
        return userService.updateUser(me.id(), dto);
    }
}
