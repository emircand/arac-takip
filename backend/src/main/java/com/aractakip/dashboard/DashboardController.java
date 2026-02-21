package com.aractakip.dashboard;

import com.aractakip.common.ApiResponse;
import com.aractakip.dashboard.dto.OzetDto;
import com.aractakip.sefer.SeferRepository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/ozet")
    public ApiResponse<OzetDto> ozet(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return ApiResponse.ok(dashboardService.getOzet(start, end));
    }

    @GetMapping("/bolge")
    public ApiResponse<List<BolgeProj>> bolge(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return ApiResponse.ok(dashboardService.getByBolge(start, end));
    }

    @GetMapping("/cekici")
    public ApiResponse<List<CekiciProj>> cekici(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return ApiResponse.ok(dashboardService.getByCekici(start, end));
    }

    @GetMapping("/sofor")
    public ApiResponse<List<SoforProj>> sofor(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return ApiResponse.ok(dashboardService.getBySofor(start, end));
    }
}
