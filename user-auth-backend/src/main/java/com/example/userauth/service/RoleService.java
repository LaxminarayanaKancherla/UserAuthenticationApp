package com.example.userauth.service;

import com.example.userauth.model.Role;
import com.example.userauth.model.User;
import com.example.userauth.repository.RoleRepository;
import com.example.userauth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @PreAuthorize("hasRole('ADMIN')")
    public Role createRole(String roleName) {
        String roleNameUpper = roleName.toUpperCase();
        if (roleRepository.existsByName(roleNameUpper)) {
            throw new RuntimeException("Role already exists");
        }
        Role role = new Role(roleNameUpper);
        return roleRepository.save(role);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Role updateRole(String oldName, String newName) {
        String oldNameUpper = oldName.toUpperCase();
        String newNameUpper = newName.toUpperCase();
        Role role = roleRepository.findByName(oldNameUpper);
        if (role == null) {
            throw new RuntimeException("Role not found");
        }
        if (!oldNameUpper.equals(newNameUpper) && roleRepository.existsByName(newNameUpper)) {
            throw new RuntimeException("New role name already exists");
        }
        role.setName(newNameUpper);
        return roleRepository.save(role);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteRole(String name) {
        String nameUpper = name.toUpperCase();
        Role role = roleRepository.findByName(nameUpper);
        if (role == null) {
            throw new RuntimeException("Role not found");
        }
        List<User> usersWithRole = userRepository.findByRole(nameUpper);
        if (!usersWithRole.isEmpty()) {
            String userEmails = usersWithRole.stream()
                .map(User::getEmail)
                .collect(Collectors.joining(", "));
            throw new RuntimeException("Cannot delete role assigned to users: " + userEmails);
        }
        roleRepository.delete(role);
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public boolean isValidRole(String roleName) {
        return roleRepository.existsByName(roleName.toUpperCase());
    }
}