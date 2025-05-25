package com.example.authservice.service;

import com.example.authservice.controller.AuthException;
import com.example.authservice.dtos.LoginDto;
import com.example.authservice.dtos.UserDto;
import com.example.authservice.dto.UserCreateDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

@RequiredArgsConstructor
@Slf4j
@Service
public class UserServiceClient
        implements IUserServiceClient {

    private final RestTemplate restTemplate;

    @Value("${api.user-service}")
    private String userServiceUrl;

    @Override
    public Optional<UserDto> getUserForLogin(final LoginDto loginDto) {
        try {

            var url = this.userServiceUrl + "/login";

            var response = this.restTemplate.postForEntity(url, loginDto, UserDto.class);

            if (response.getStatusCode()
                        .isError()) {
                throw new AuthException(AuthException.GENERIC_LOGIN_FAIL);
            }

            return Optional.ofNullable(response.getBody());
        } catch (Exception e) {
            return Optional.empty();
        }

    }

    @Override
    public boolean createUser(final UserDto userDto) {
        try {
            var url = this.userServiceUrl;
            
            // Convert UserDto to UserCreateDto with all required fields
            // Note: The password should be provided by the client during registration
            // For now, we'll generate a random password, but this should be changed
            // to get the password from the registration request
            String randomPassword = "TemporaryPassword123!"; // Temporary solution
            
            var userCreateDto = UserCreateDto.builder()
                .name(userDto.name())
                .email(userDto.email())
                .username(userDto.username())
                .password(randomPassword)
                .build();
            
            var response = this.restTemplate.postForEntity(url, userCreateDto, UserDto.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Failed to create user: " + e.getMessage());
        }
    }
}
