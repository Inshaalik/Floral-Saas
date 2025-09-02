// ownerDashboard.js
import { supabase } from "../js/supabaseClient.js";
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

document.addEventListener("DOMContentLoaded", async () => {
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
    let ownerTierLimit = 5; // default max sub-users; can fetch from DB later

    // ----- Helper Functions -----
    function renderSubUsers() {
        subUserTable.innerHTML = "";
        subUsers.forEach((user, i) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td><button data-index="${i}" class="removeSubUser">Remove</button></td>
            `;
            subUserTable.appendChild(row);
        });
        addSubUserListeners();
    }

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
                    console.error(error);
                    alert("Failed to remove sub-user: " + error.message);
                } else {
                    subUsers.splice(i, 1);
                    renderSubUsers();
                    alert("Sub-user removed.");
                }
            });
        });
    }

    // ----- Load Owner and Sub-Users -----
    async function loadOwnerAndSubUsers() {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
            window.location.href = "/login.html";
            return;
        }

        const { data: ownerData, error: ownerError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.session.user.id)
            .single();

        if (ownerError || !ownerData) {
            console.error(ownerError);
            alert("Failed to load owner profile.");
            return;
        }

        if (ownerData.role !== "owner") {
            alert("Access denied: Only owners can access this page.");
            window.location.href = "/flowerCalculator.html";
            return;
        }

        owner = ownerData;
        ownerTierLimit = owner.tier_max_subusers || 5;

        // Load sub-users
        const { data: usersData, error: usersError } = await supabase
            .from("profiles")
            .select("*")
            .eq("owner_id", owner.id);

        if (usersError) {
            console.error(usersError);
            alert("Failed to load sub-users.");
            return;
        }

        subUsers = usersData || [];
        renderSubUsers();
    }

    // ----- Invite Sub-User -----
    inviteButton.addEventListener("click", async () => {
        const email = inviteEmailInput.value.trim().toLowerCase();
        if (!email) {
            alert("Enter a valid email to invite.");
            return;
        }

        if (subUsers.length >= ownerTierLimit) {
            alert(`You have reached your tier limit of ${ownerTierLimit} sub-users.`);
            return;
        }

        const inviteCode = uuidv4();
        const { error } = await supabase.from("subuser_invites").insert([{
            owner_id: owner.id,
            email,
            code: inviteCode,
            created_at: new Date()
        }]);

        if (error) {
            console.error(error);
            alert("Failed to create invite: " + error.message);
            return;
        }

        // Here you would send the email with the invite link
        const inviteLink = `${window.location.origin}/signup.html?invite=${inviteCode}`;
        alert(`Invite link generated: ${inviteLink}`);
        inviteEmailInput.value = "";
    });

    // ----- Navigation -----
    navAdminBtn?.addEventListener("click", () => {
        window.location.href = "/admin/admin.html";
    });

    navCalculatorBtn?.addEventListener("click", () => {
        window.location.href = "/flowerCalculator.html";
    });

    navAnalyticsBtn?.addEventListener("click", () => {
        window.location.href = "/analytics.html";
    });

    homeBtn?.addEventListener("click", () => {
        window.location.href = "/ownerDashboard.html";
    });

    // ----- Initialize -----
    await loadOwnerAndSubUsers();
});
