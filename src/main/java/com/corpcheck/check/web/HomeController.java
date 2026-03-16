package com.corpcheck.check.web;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "home";
    }

    @GetMapping("/corporate")
    public String corporate(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        // Добавляем username в модель
        model.addAttribute("username", userDetails != null ? userDetails.getUsername() : "anonymous");
        return "corporate-realtime";
    }
}