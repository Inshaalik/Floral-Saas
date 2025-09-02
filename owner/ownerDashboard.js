// ownerDashboard.js
import { supabase } from "../js/supabaseClient.js";
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';
import { requireRole, getCurrentUser } from '../js/session.js';

document.addEventListener("DOMContentLoaded", async () => {
    // ----- Restrict page to owners only -----
    const user = await requireRole(['owner']);
    if (!user) return; // if role check fails, page will redirect automatically

    // ----- DOM Elements -----
    const subUserTable = document.getElementById("subUserList");
    const inviteEmailInput = document.getElementById("inviteEmail");
    const inviteButton = document.getElementById("inviteButton");
    const navAdminBtn = document.getElementById("navAdminBtn");
    const navCalculatorBtn = document.getElementById("navCalculatorBtn");
    const navAnalyticsBtn = document.getElementById("navAnalyticsBtn");
    const homeBtn = document.getElementById("homeBtn");

    let owner = null;
    let subUsers = [];
    let ownerTierLimit = 5;

    // ----- Load Owner and Sub-Users -----
    async function loadOwnerAndSubUsers() {
        try {
            const { data: ownerData, error: ownerError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (ownerError || !ownerData) throw ownerError;

            owner = ownerData;
            ownerTierLimit = owner.tier_max_subusers || 5;

            // Load sub-users
            const { data: usersData, error: usersError } = await supabase
                .from("profiles")
                .select("*")
                .eq("owner_id", owner.id);

            if (usersError) throw usersError;

            subUsers = usersData || [];
            renderSubUsers();

        } catch (err) {
            console.error(err);
            alert("Failed to load owner or sub-users.");
        }
    }

    // ----- Render Sub-Users -----
    function renderSubUsers() {
        subUserTable.innerHTML = "";
        subUsers.forEach((u, i) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td><button data-index="${i}" class="removeSubUser">Remove</button></td>
            `;
            subUserTable.appendChild(row);
        });
        addSubUserListeners();
    }

    // ----- Remove Sub-User -----
    function addSubUserListeners() {
        document.querySelectorAll(".removeSubUser").forEach(btn => {
            btn.addEventListener("click", async e => {
                const i = e.target.dataset.index;
                const userToRemove = subUsers[i];
                if (!userToRemove) return;

                const { error } = await supabase
                    .from("profiles")
                    .delete()
                    .eq("id", userToRemove.id);

                if (error) {
                    alert("Failed to remove sub-user: " + error.message);
                } else {
                    subUsers.splice(i, 1);
                    renderSubUsers();
                    alert("Sub-user removed.");
                }
            });
        });
    }

    // ----- Invite Sub-User -----
    inviteButton.addEventListener("click", async () => {
        const email = inviteEmailInput.value.trim().toLowerCase();
        if (!email) return alert("Enter a valid email.");
        if (subUsers.length >= ownerTierLimit) return alert(`Reached tier limit of ${ownerTierLimit} sub-users.`);

        const inviteCode = uuidv4();
        const { error } = await supabase.from("subuser_invites").insert([{
            owner_id: owner.id,
            email,
            code: inviteCode,
            created_at: new Date()
        }]);

        if (error) return alert("Failed to create invite: " + error.message);

        const inviteLink = `${window.location.origin}/signup.html?invite=${inviteCode}`;
        alert(`Invite link generated: ${inviteLink}`);
        inviteEmailInput.value = "";
    });

    // ----- Navigation -----
    navAdminBtn?.addEventListener("click", () => window.location.href = "/admin/admin.html");
    navCalculatorBtn?.addEventListener("click", () => window.location.href = "/flowerCalculator.html");
    navAnalyticsBtn?.addEventListener("click", () => window.location.href = "/analytics.html");
    homeBtn?.addEventListener("click", () => window.location.href = "/owner/ownerDashboard.html");

    // ----- Initialize -----
    await loadOwnerAndSubUsers();
});
