##
## $(call run-command-in-modules,install,app1 app2 app3,apps)
##
## this will run make install in those 3 apps, located in the 'apps' directory
##

define run-command-in-modules
	@for app in $(2); do \
		echo "→ Running $(1) in /$(3)/$$app"; \
		$(MAKE) -s -C $(3)/$$app $(1) || true; \
	done
endef
